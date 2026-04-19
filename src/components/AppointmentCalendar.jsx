import { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import trLocale from '@fullcalendar/core/locales/tr';

/**
 * Appointment Calendar Component
 * FullCalendar ile randevu takvimi
 */
export default function AppointmentCalendar({
  appointments = [],
  onDateClick,
  onEventClick,
  onEventDrop,
  onEventResize,
}) {
  const calendarRef = useRef(null);

  // Randevuları FullCalendar event formatına çevir
  const events = appointments.map((apt) => ({
    id: apt.id,
    title: `${apt.customer_name} - ${apt.service?.name || 'Hizmet'}`,
    start: `${apt.appointment_date}T${apt.appointment_time}`,
    end: calculateEndTime(apt.appointment_date, apt.appointment_time, apt.service?.duration_minutes || 60),
    backgroundColor: getStatusColor(apt.status),
    borderColor: getStatusColor(apt.status),
    extendedProps: {
      customerName: apt.customer_name,
      customerPhone: apt.customer_phone,
      serviceName: apt.service?.name,
      staffName: apt.staff?.full_name,
      status: apt.status,
      price: apt.service?.price,
    },
  }));

  // Bitiş zamanını hesapla
  function calculateEndTime(date, time, durationMinutes) {
    const [hours, minutes] = time.split(':').map(Number);
    const startDate = new Date(`${date}T${time}`);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return endDate.toISOString();
  }

  // Durum rengini al
  function getStatusColor(status) {
    const colors = {
      pending: '#F59E0B', // Amber
      confirmed: '#10B981', // Green
      completed: '#6366F1', // Indigo
      cancelled: '#EF4444', // Red
    };
    return colors[status] || '#71717A';
  }

  // Event render - Tooltip için
  const renderEventContent = (eventInfo) => {
    return (
      <div className="p-1 overflow-hidden">
        <div className="font-bold text-xs truncate">{eventInfo.event.title}</div>
        <div className="text-xs opacity-90 truncate">
          {eventInfo.event.extendedProps.staffName}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        locale={trLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{
          today: 'Bugün',
          month: 'Ay',
          week: 'Hafta',
          day: 'Gün',
        }}
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotDuration="00:30:00"
        allDaySlot={false}
        height="auto"
        events={events}
        eventContent={renderEventContent}
        dateClick={onDateClick}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        editable={true}
        droppable={true}
        eventResizableFromStart={true}
        nowIndicator={true}
        weekends={true}
        dayMaxEvents={true}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        slotLabelFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
        // Stil özelleştirmeleri
        eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
        dayCellClassNames="hover:bg-zinc-50 transition-colors"
      />

      <style jsx global>{`
        /* FullCalendar özelleştirmeleri */
        .fc {
          font-family: 'Manrope', sans-serif;
        }

        .fc-theme-standard .fc-scrollgrid {
          border-color: #e4e4e7;
        }

        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: #e4e4e7;
        }

        .fc-col-header-cell {
          background-color: #fafafa;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          color: #71717a;
        }

        .fc-button {
          background-color: #18181b !important;
          border-color: #18181b !important;
          font-weight: 600;
          text-transform: capitalize;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
        }

        .fc-button:hover {
          background-color: #27272a !important;
        }

        .fc-button-active {
          background-color: #f43f5e !important;
          border-color: #f43f5e !important;
        }

        .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #18181b;
        }

        .fc-event {
          border-radius: 0.5rem;
          padding: 0.25rem;
          font-size: 0.875rem;
        }

        .fc-timegrid-slot {
          height: 3rem;
        }

        .fc-timegrid-slot-label {
          font-size: 0.75rem;
          color: #71717a;
        }

        .fc-day-today {
          background-color: #fef2f2 !important;
        }

        .fc-highlight {
          background-color: #fce7f3 !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .fc-toolbar {
            flex-direction: column;
            gap: 0.5rem;
          }

          .fc-toolbar-chunk {
            display: flex;
            justify-content: center;
          }

          .fc-button {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }

          .fc-toolbar-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
