using MusicLab.Web.Models;

namespace MusicLab.Web.ViewModels;

public class MusicLabViewModel
{
    public List<Cancion> Biblioteca { get; set; } = new();

    public List<Cancion> Cola { get; set; } = new();

    public List<Cancion> Historial { get; set; } = new();

    public Cancion? Actual { get; set; }

    public string Busqueda { get; set; } = string.Empty;

    public string? AlbumSeleccionado { get; set; }

    public List<Cancion> CancionesAlbum { get; set; } = new();
}
