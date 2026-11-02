import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import api from '../services/api';
import { LoadingState, ErrorState, EmptyState } from '../components/StatusStates';
export const MapPage = () => {
    const [sedes, setSedes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const fetchMapaOfertas = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get('/mapa/ofertas');
            if (Array.isArray(response.data)) {
                setSedes(response.data);
            }
            else {
                setSedes([]);
            }
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Error al cargar el mapa de ofertas de supermercados');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchMapaOfertas();
    }, []);
    if (loading) {
        return _jsx(LoadingState, { message: "Cargando mapa de ofertas en Manizales..." });
    }
    if (error) {
        return _jsx(ErrorState, { title: "Error al cargar el mapa", message: error, onRetry: fetchMapaOfertas });
    }
    if (sedes.length === 0) {
        return (_jsx(EmptyState, { title: "Sin ofertas disponibles", message: "A\u00FAn no hay ofertas de supermercados", actionText: "Actualizar", onAction: fetchMapaOfertas }));
    }
    const manizalesCenter = [5.0689, -75.5174];
    return (_jsx("div", { className: "map-page-container", style: { height: 'calc(100vh - 120px)', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color, #e0e0e0)' }, children: _jsxs(MapContainer, { center: manizalesCenter, zoom: 13, scrollWheelZoom: true, style: { height: '100%', width: '100%' }, children: [_jsx(TileLayer, { attribution: '\u00A9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" }), sedes.map((sede, idx) => (_jsx(Marker, { position: [sede.latitud, sede.longitud], children: _jsx(Popup, { children: _jsxs("div", { style: { minWidth: '200px' }, children: [_jsx("h4", { style: { margin: '0 0 0.25rem 0', color: 'var(--primary-blue, #0056b3)' }, children: sede.cadena }), _jsx("p", { style: { fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: '#333' }, children: sede.nombre }), _jsx("div", { style: { maxHeight: '150px', overflowY: 'auto' }, children: sede.ofertas.map((of, i) => (_jsxs("div", { style: { borderTop: '1px solid #eee', padding: '4px 0', fontSize: '0.8rem' }, children: [_jsx("strong", { children: of.producto }), _jsxs("div", { style: { color: '#0056b3', fontWeight: 'bold' }, children: ["$", Number(of.precio).toLocaleString()] }), _jsxs("div", { style: { color: '#666', fontSize: '0.7rem' }, children: ["V\u00E1lido hasta: ", new Date(of.vigencia).toLocaleDateString()] })] }, i))) })] }) }) }, idx)))] }) }));
};
export default MapPage;
