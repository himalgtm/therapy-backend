const express = require('express');
const { calendar } = require('../lib/googleCalendarService');

const router = express.Router();

// Create Appointment
router.post('/create', async (req, res) => {
  try {
    const { clientId, therapistId, date, time, reason, clientEmail } = req.body;

    const eventStartTime = new Date(`${date}T${time}:00`);
    const eventEndTime = new Date(eventStartTime);
    eventEndTime.setMinutes(eventEndTime.getMinutes() + 45); // 45-min session

    const event = {
      summary: `Therapy Session - ${clientId}`,
      description: reason,
      start: {
        dateTime: eventStartTime.toISOString(),
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: eventEndTime.toISOString(),
        timeZone: 'America/New_York',
      },
      attendees: [
        { email: 'hgautam@caldwell.edu' },
        { email: clientEmail }
      ],
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2),
          conferenceSolutionKey: {
            type: "hangoutsMeet"
          }
        }
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'hgautam@caldwell.edu',
      resource: event,
      conferenceDataVersion: 1,
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      eventLink: response.data.htmlLink,
      meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri || null
    });
  } catch (error) {
    console.error('Calendar Create Error:', error);
    res.status(500).json({ error: 'Unable to create appointment' });
  }
});

// Fetch Upcoming Appointments
router.get('/upcoming', async (req, res) => {
    try {
      const today = new Date();
      
      const response = await calendar.events.list({
        calendarId: 'hgautam@caldwell.edu',
        timeMin: today.toISOString(), // Start from today
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
  
      const events = response.data.items;
      if (!events || events.length === 0) {
        return res.status(200).json({ message: 'No upcoming events found.' });
      }
  
      res.status(200).json(events);
    } catch (error) {
      console.error('Fetch Upcoming Appointments Error:', error);
      res.status(500).json({ error: 'Failed to fetch appointments' });
    }
  });  

module.exports = router;