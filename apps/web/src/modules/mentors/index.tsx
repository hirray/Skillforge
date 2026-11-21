import { Routes, Route } from 'react-router-dom';
import { MentorDirectory } from './MentorDirectory';

export default function MentorsModule() {
  return (
    <Routes>
      <Route path="/" element={<MentorDirectory />} />
      <Route path="*" element={<MentorDirectory />} />
    </Routes>
  );
}
