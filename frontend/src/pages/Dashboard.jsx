// 📁 src/Dashboard.jsx
import { useParams } from 'react-router-dom';


export default function Dashboard() {
  const { id } = useParams();
  return <h1>Dashboard for {id}</h1>;
}
