using MusicLab.Web.Models;

namespace MusicLab.Web.Services;

public class PlaybackService
{
    private readonly ColaCanciones _cola;
    private readonly PilaHistorial _historial;

    public Cancion? Actual { get; private set; }

    public PlaybackService(
        ColaCanciones cola,
        PilaHistorial historial)
    {
        _cola = cola;
        _historial = historial;
    }

    public void InicializarAleatoria(IEnumerable<Cancion> canciones)
    {
        if (Actual != null)
            return;

        var disponibles = canciones.ToList();

        if (disponibles.Count == 0)
            return;

        Actual = disponibles[Random.Shared.Next(disponibles.Count)];
    }

    public void AgregarACola(Cancion cancion)
    {
        _cola.Encolar(cancion);
    }

    public Cancion Reproducir(Cancion cancion)
    {
        if (Actual != null && Actual.Id != cancion.Id)
            _historial.Apilar(Actual);

        Actual = cancion;
        return Actual;
    }

    public Cancion? ReproducirSiguiente()
    {
        var siguiente = _cola.Desencolar();

        if (siguiente == null)
            return null;

        if (Actual != null)
            _historial.Apilar(Actual);

        Actual = siguiente;
        return Actual;
    }

    public Cancion? RecuperarAnterior()
    {
        var anterior = _historial.Desapilar();

        if (anterior == null)
            return null;

        if (Actual != null)
            _cola.Encolar(Actual);

        Actual = anterior;
        return Actual;
    }

    public List<Cancion> ObtenerCola()
    {
        return _cola.ObtenerTodas();
    }

    public List<Cancion> ObtenerHistorial()
    {
        return _historial.ObtenerHistorial();
    }
}

