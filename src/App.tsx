import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

type Car = {
  id: number;
  name: string;
  model: string;
  year: number;
  color: string;
  price: number;
  latitude: number;
  longitude: number;
};


delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const App: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof Car>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetch('https://ofc-test-01.tspb.su/test-task/vehicles')
      .then(res => res.json())
      .then(data => {
        setCars(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Ошибка загрузки:', error);
        setLoading(false);
      });
  }, []);

  const handleSort = (field: keyof Car) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id: number) => {
    setCars(prevCars => prevCars.filter(car => car.id !== id));
  };

  const sortedCars = [...cars].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="App">
      <header style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <img
          className="logo"
          src="/img/logo.svg" 
          alt="Логотип"
          style={{ height: '60px', marginRight: '15px' }}
        />
        <h1 style={{ color: 'white' }}>Список машин</h1>
      </header>

      <table border={1} cellPadding={10} style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Марка</th>
            <th onClick={() => handleSort('model')} style={{ cursor: 'pointer' }}>Модель</th>
            <th onClick={() => handleSort('year')} style={{ cursor: 'pointer' }}>Год</th>
            <th onClick={() => handleSort('color')} style={{ cursor: 'pointer' }}>Цвет</th>
            <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>Цена ($)</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {sortedCars.map(car => (
            <tr key={car.id}>
              <td>{car.name}</td>
              <td>{car.model}</td>
              <td>{car.year}</td>
              <td>{car.color}</td>
              <td>{car.price}</td>
              <td>
                <button onClick={() => handleDelete(car.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '40px' }}>Местоположение машин на карте</h2>
      <MapContainer
        center={[59.93, 30.33]}
        zoom={11}
        style={{ height: '400px', width: '100%', marginTop: '10px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {cars.map(car => (
          <Marker key={car.id} position={[car.latitude, car.longitude]}>
            <Popup>
              {car.name} {car.model} <br />
              Год: {car.year} <br />
              Цена: ${car.price}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default App;
