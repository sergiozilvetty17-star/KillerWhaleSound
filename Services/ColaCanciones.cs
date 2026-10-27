using MusicLab.Web.Models;

namespace MusicLab.Web.Services;

public class ColaCanciones
{
    private class Nodo
    {
        public Cancion Cancion { get; }
        public Nodo? Siguiente { get; set; }

        public Nodo(Cancion cancion)
        {
            Cancion = cancion;
        }
    }

    private Nodo? _frente;
    private Nodo? _final;

    public int Cantidad { get; private set; }

    public bool EstaVacia => _frente == null;

    public void Encolar(Cancion cancion)
    {
        var nuevo = new Nodo(cancion);

        if (_final == null)
        {
            _frente = nuevo;
            _final = nuevo;
        }
        else
        {
            _final.Siguiente = nuevo;
            _final = nuevo;
        }

        Cantidad++;
    }

    public Cancion? Desencolar()
    {
        if (_frente == null)
            return null;

        var cancion = _frente.Cancion;
        _frente = _frente.Siguiente;

        if (_frente == null)
            _final = null;

        Cantidad--;
        return cancion;
    }

    public Cancion? VerPrimera()
    {
        return _frente?.Cancion;
    }

    public List<Cancion> ObtenerTodas()
    {
        var resultado = new List<Cancion>();
        var actual = _frente;

        while (actual != null)
        {
            resultado.Add(actual.Cancion);
            actual = actual.Siguiente;
        }

        return resultado;
    }

    public void Limpiar()
    {
        _frente = null;
        _final = null;
        Cantidad = 0;
    }
}
