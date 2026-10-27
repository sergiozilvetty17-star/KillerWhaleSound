using Microsoft.AspNetCore.Mvc;
using MusicLab.Web.Services;
using MusicLab.Web.ViewModels;

namespace MusicLab.Web.Controllers;

public class HomeController : Controller
{
    private readonly MusicLibraryService _biblioteca;
    private readonly PlaybackService _reproductor;

    public HomeController(
        MusicLibraryService biblioteca,
        PlaybackService reproductor)
    {
        _biblioteca = biblioteca;
        _reproductor = reproductor;
    }

    public IActionResult Index(string? buscar, string? album)
    {
        var canciones = _biblioteca.ObtenerCanciones();

        _reproductor.InicializarAleatoria(canciones);

        var cancionesAlbum = !string.IsNullOrWhiteSpace(album)
            ? canciones.Where(c => string.Equals(
                c.Album, album, StringComparison.OrdinalIgnoreCase)).ToList()
            : new List<MusicLab.Web.Models.Cancion>();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            canciones = canciones
                .Where(c =>
                    c.Titulo.Contains(
                        buscar, StringComparison.OrdinalIgnoreCase) ||
                    c.Artista.Contains(
                        buscar, StringComparison.OrdinalIgnoreCase) ||
                    c.Album.Contains(
                        buscar, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        var modelo = new MusicLabViewModel
        {
            Biblioteca = canciones,
            Cola = _reproductor.ObtenerCola(),
            Historial = _reproductor.ObtenerHistorial(),
            Actual = _reproductor.Actual,
            Busqueda = buscar ?? string.Empty,
            AlbumSeleccionado = album,
            CancionesAlbum = cancionesAlbum
        };

        return View(modelo);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult AgregarAColaApi(int id)
    {
        var cancion = _biblioteca.ObtenerCanciones()
            .FirstOrDefault(c => c.Id == id);

        if (cancion != null)
            _reproductor.AgregarACola(cancion);

        return Json(Estado());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult ReproducirApi(int id)
    {
        var cancion = _biblioteca.ObtenerCanciones()
            .FirstOrDefault(c => c.Id == id);

        if (cancion != null)
            _reproductor.Reproducir(cancion);

        return Json(Estado());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult SiguienteApi()
    {
        _reproductor.ReproducirSiguiente();
        return Json(Estado());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult AnteriorApi()
    {
        _reproductor.RecuperarAnterior();
        return Json(Estado());
    }

    [HttpGet]
    public IActionResult Portada(string? titulo, string? artista)
    {
        titulo ??= "Cancion";
        artista ??= "MusicLab";

        var clave = System.Security.Cryptography.SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(titulo + "|" + artista)
        );

        var tono = (clave[0] * 256 + clave[1]) % 360;
        var tonoSecundario = (tono + 38 + clave[2] % 45) % 360;

        var svg = $@"<svg xmlns=""http://www.w3.org/2000/svg"" viewBox=""0 0 400 400"">
  <defs>
    <linearGradient id=""fondo"" x1=""0"" y1=""0"" x2=""1"" y2=""1"">
      <stop offset=""0%"" stop-color=""#171b24""/>
      <stop offset=""100%"" stop-color=""#080b10""/>
    </linearGradient>
    <linearGradient id=""luz"" x1=""0"" y1=""0"" x2=""1"" y2=""1"">
      <stop offset=""0%"" stop-color=""hsl({tono}, 95%, 68%)""/>
      <stop offset=""100%"" stop-color=""hsl({tonoSecundario}, 90%, 55%)""/>
    </linearGradient>
    <radialGradient id=""brillo"">
      <stop offset=""0%"" stop-color=""hsl({tono}, 90%, 55%)"" stop-opacity="".27""/>
      <stop offset=""100%"" stop-color=""hsl({tono}, 90%, 35%)"" stop-opacity=""0""/>
    </radialGradient>
  </defs>
  <rect width=""400"" height=""400"" rx=""30"" fill=""url(#fondo)""/>
  <circle cx=""200"" cy=""200"" r=""175"" fill=""url(#brillo)""/>
  <g fill=""none"" stroke=""url(#luz)"" stroke-linecap=""round"">
    <circle cx=""200"" cy=""200"" r=""116"" stroke-width=""1.5"" opacity="".23""/>
    <circle cx=""200"" cy=""200"" r=""91"" stroke-width=""1.5"" opacity="".4""/>
    <circle cx=""200"" cy=""200"" r=""67"" stroke-width=""2"" opacity="".65""/>
    <path d=""M48 213 C85 213 85 154 122 154 S159 249 196 249 S233 133 270 133 S307 213 352 213"" stroke-width=""4""/>
    <path d=""M66 245 C101 245 101 190 136 190 S171 226 206 226 S241 170 276 170 S311 245 334 245"" stroke-width=""2"" opacity="".55""/>
  </g>
  <circle cx=""200"" cy=""200"" r=""43"" fill=""#0d1219"" stroke=""url(#luz)"" stroke-width=""2""/>
  <text x=""200"" y=""216"" text-anchor=""middle"" font-size=""49"" font-family=""Arial, sans-serif"" font-weight=""700"" fill=""url(#luz)"">♫</text>
  <g fill=""url(#luz)"">
    <circle cx=""200"" cy=""57"" r=""3""/>
    <circle cx=""343"" cy=""200"" r=""3""/>
    <circle cx=""200"" cy=""343"" r=""3""/>
    <circle cx=""57"" cy=""200"" r=""3""/>
  </g>
  <text x=""22"" y=""370"" fill=""#8995a7"" font-size=""11"" letter-spacing=""4"" font-family=""Arial, sans-serif"">MUSICLAB</text>
  <circle cx=""373"" cy=""366"" r=""4"" fill=""hsl({tono}, 90%, 65%)""/>
</svg>";

        return Content(svg, "image/svg+xml; charset=utf-8");
    }
    private object Estado()
    {
        return new
        {
            actual = _reproductor.Actual,
            cola = _reproductor.ObtenerCola(),
            historial = _reproductor.ObtenerHistorial()
        };
    }
}


