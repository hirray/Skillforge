import { Routes, Route } from 'react-router-dom';
import { HackathonsList } from './HackathonsList';
import { HackathonDetail } from './HackathonDetail';

export default function HackathonsModule() {
  return (
    <Routes>
      <Route path="/" element={<HackathonsList />} />
      <Route path="/:id" element={<HackathonDetail />} />
      <Route path="*" element={<HackathonsList />} />
    </Routes>
  );
}
