using MusicLab.Web.Models;

namespace MusicLab.Web.Services;

public class MusicLibraryService
{
    private readonly string _carpetaMusica;

    public MusicLibraryService(IWebHostEnvironment environment)
    {
        _carpetaMusica = Path.Combine(
            environment.WebRootPath ?? "wwwroot",
            "music"
        );

        Directory.CreateDirectory(_carpetaMusica);
    }

    public List<Cancion> ObtenerCanciones()
    {
        var archivos = Directory
            .GetFiles(_carpetaMusica, "*.mp3", SearchOption.TopDirectoryOnly)
            .OrderBy(Path.GetFileName, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var canciones = new List<Cancion>();
        var id = 1;

        foreach (var archivo in archivos)
        {
            var nombreArchivo = Path.GetFileName(archivo);
            var nombreBase = Path.GetFileNameWithoutExtension(nombreArchivo);

            var titulo = nombreBase.Replace('_', ' ').Trim();
            var artista = "Artista desconocido";
            var album = "Sin álbum";

            var separadorAlbum = nombreBase.IndexOf(
                "_1-",
                StringComparison.Ordinal
            );

            var nombreSinAlbum = separadorAlbum >= 0
                ? nombreBase[..separadorAlbum]
                : nombreBase;

            var separadorArtista = nombreSinAlbum.IndexOf('-');

            if (separadorArtista > 0 &&
                separadorArtista < nombreSinAlbum.Length - 1)
            {
                titulo = nombreSinAlbum[..separadorArtista]
                    .Replace('_', ' ')
                    .Trim();

                artista = nombreSinAlbum[(separadorArtista + 1)..]
                    .Replace('_', ' ')
                    .Trim();
            }

            if (separadorAlbum >= 0)
            {
                var nombreAlbum = nombreBase[(separadorAlbum + 3)..]
                    .Replace('_', ' ')
                    .Trim();

                if (!string.IsNullOrWhiteSpace(nombreAlbum))
                    album = nombreAlbum;
            }

            canciones.Add(new Cancion
            {
                Id = id++,
                Titulo = titulo,
                Artista = artista,
                Album = album,
                Archivo = "/music/" + Uri.EscapeDataString(nombreArchivo),
                Portada = "/Home/Portada?titulo=" + Uri.EscapeDataString(titulo) + "&artista=" + Uri.EscapeDataString(artista)
            });
        }

        return canciones;
    }
}
