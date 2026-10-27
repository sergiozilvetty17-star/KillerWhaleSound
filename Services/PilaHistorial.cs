using MusicLab.Web.Models;

namespace MusicLab.Web.Services;

public class PilaHistorial
{
    private class Nodo
    {
        public Cancion Cancion { get; }
        public Nodo? Siguiente { get; set; }

        public Nodo(Cancion cancion, Nodo? siguiente)
        {
            Cancion = cancion;
            Siguiente = siguiente;
        }
    }

    private Nodo? _cima;

    public int Cantidad { get; private set; }

    public bool EstaVacia => _cima == null;

    public void Apilar(Cancion cancion)
    {
        _cima = new Nodo(cancion, _cima);
        Cantidad++;
    }

    public Cancion? Desapilar()
    {
        if (_cima == null)
            return null;

        var cancion = _cima.Cancion;
        _cima = _cima.Siguiente;
        Cantidad--;

        return cancion;
    }

    public Cancion? VerCima()
    {
        return _cima?.Cancion;
    }

    public List<Cancion> ObtenerHistorial()
    {
        var resultado = new List<Cancion>();
        var actual = _cima;

        while (actual != null)
        {
            resultado.Add(actual.Cancion);
            actual = actual.Siguiente;
        }

        return resultado;
    }

    public void Limpiar()
    {
        _cima = null;
        Cantidad = 0;
    }
}
