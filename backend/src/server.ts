import app from './app';
import { startDeadlineMonitor } from './jobs/deadlineMonitor';

const PORT = process.env.PORT || 3001;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  
  // Start Background Jobs
  startDeadlineMonitor();
});
