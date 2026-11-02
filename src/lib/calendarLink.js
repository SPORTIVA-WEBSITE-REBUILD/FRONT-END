// Builds a Google Calendar "render" link from public webinar fields only —
// title, startsAt, endsAt. Never includes meetUrl: that field is never sent
// to the public site at all (see getWebinar()/the API's publicFields()), so
// there is nothing here that could leak it even by mistake.
function toGCalDate(date) {
  return new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function googleCalendarUrl({ title, startsAt, endsAt }) {
  if (!title || !startsAt) return '';
  const start = toGCalDate(startsAt);
  const end = endsAt ? toGCalDate(endsAt) : start;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
