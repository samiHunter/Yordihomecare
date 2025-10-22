// Book a Tour page logic (12-hour time display)
const dateEl   = document.getElementById('date');
const timeEl   = document.getElementById('time');
const form     = document.getElementById('tourForm');
const statusEl = document.getElementById('status');
const yearEl   = document.getElementById('year');

// Footer year
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Min date = tomorrow
(function(){
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const iso = d.toISOString().slice(0,10);
  if (dateEl) dateEl.min = iso;
})();

// Build time slots with 12-hour labels (value stays 24-hour for ICS correctness)
function buildTimes(dateStr){
  timeEl.innerHTML = '<option value="" disabled selected>Select a time</option>';
  if(!dateStr) return;

  const d = new Date(dateStr + 'T00:00:00');
  const weekday = d.getDay(); // 0 = Sunday
  if (weekday === 0){
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Closed on Sundays — please pick another date';
    timeEl.appendChild(opt);
    return;
  }

  const slots = [
    { label: '10:00 AM', value: '10:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '12:30 PM',  value: '12:30' },
    { label: '2:00 PM',  value: '14:00' },
    { label: '2:30 PM',  value: '14:30' },
    { label: '4:00 PM',  value: '16:00' },
    { label: '4:30 PM',  value: '16:30' },
    { label: '6:00 PM',  value: '18:00' }
  ];

  for (const s of slots){
    const opt = document.createElement('option');
    opt.value = s.value;          // used for ICS (24-hour)
    opt.textContent = s.label;    // shown to users (12-hour)
    timeEl.appendChild(opt);
  }
}
dateEl?.addEventListener('change', (e)=> buildTimes(e.target.value));

// Create an .ics calendar invite
function makeICS({title, description, start, durationMinutes=45, location}){
  const dtStart = new Date(start);
  const dtEnd = new Date(dtStart.getTime() + durationMinutes*60000);
  const toICS = (d)=> d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/, 'Z');
  const uid = 'tour-' + Date.now() + '@yordi';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-/Yordi/Tour Scheduler/EN',
    'BEGIN:VEVENT',
    'UID:'+uid,
    'DTSTAMP:'+toICS(new Date()),
    'DTSTART:'+toICS(dtStart),
    'DTEND:'+toICS(dtEnd),
    'SUMMARY:'+title,
    'DESCRIPTION:'+String(description || '').replace(/\n/g,'\\n'),
    'LOCATION:'+location,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

function download(filename, content, mime='text/calendar'){
  const blob = new Blob([content], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

form?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  if(!data.date || !data.time){
    alert('Please choose a date and time.');
    return;
  }

  // Use the selected option's label (12-hour) for the human message,
  // and its value (24-hour) for the ICS file.
  const selected = timeEl.options[timeEl.selectedIndex];
  const timeLabel = selected.textContent;   // e.g., "2:00 PM"
  const timeValue = selected.value;         // e.g., "14:00"

  const startISO = `${data.date}T${timeValue}:00`;
  const summary = 'Yordi Home Care — Tour';
  const descLines = [
    `Name: ${data.name||''}`,
    `Email: ${data.email||''}`,
    `Phone: ${data.phone||''}`,
    `For: ${data.for||''}`,
    `Party size: ${data.party||''}`,
    `Contact preference: ${data.contact||'email'}`,
    '',
    (data.notes? 'Notes: '+data.notes : '')
  ].join('\n').trim();

  const ics = makeICS({
    title: summary,
    description: descLines,
    start: startISO,
    location: '1234 Willow Lane, Oakland, CA 94605'
  });
  download('Yordi-Home-Care-Tour.ics', ics);

  const human = `Tour request submitted.\n\nDate: ${data.date}\nTime: ${timeLabel}\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nParty size: ${data.party||'2'}\nPreference: ${data.contact||'email'}\n\nWe will confirm shortly.`;
  statusEl.hidden = false;
  statusEl.textContent = human;

  form.reset();
  timeEl.innerHTML = '<option value="" disabled selected>Select a time</option>';
});
