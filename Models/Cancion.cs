namespace MusicLab.Web.Models;

public class Cancion
{
    public int Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string Artista { get; set; } = string.Empty;
    public string Album { get; set; } = string.Empty;
    public string Archivo { get; set; } = string.Empty;
    public string Portada { get; set; } = "/images/cover.svg";
}
