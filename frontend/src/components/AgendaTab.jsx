import React, { useState, useEffect, useCallback } from "react";

// Horários de trabalho: 9h às 17h, 1h de almoço
const WORK_HOURS = [9, 10, 11, 12, 14, 15, 16];
const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

// Função auxiliar para calcular o início da semana (segunda-feira)
const getWeekStart = (date) => {
  const dayOfWeek = date.getDay(); // 0 = domingo
  // Calcula o offset para a segunda-feira (1)
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const AgendaTab = ({ doctorId, token }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patients, setPatients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Estado para a data de início da semana atual
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getWeekStart(new Date())
  );

  // Função para buscar agendamentos, extraída para ser reutilizada
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/appointments/?doctor=${doctorId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setAppointments(data);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
    } finally {
      setLoading(false);
    }
  }, [doctorId, token]); // Dependências: doctorId e token

  // Carrega agendamentos e pacientes na montagem e quando a semana muda
  useEffect(() => {
    fetchAppointments();

    const fetchPatients = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/patients/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setPatients(data);
      } catch (err) {
        console.error("Erro ao buscar pacientes:", err);
      }
    };

    fetchPatients();
  }, [fetchAppointments, token]); // Dependência: fetchAppointments (usando useCallback) e token

  // Funções de navegação
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  // Função auxiliar para obter a data de um dia específico da semana
  const getDateForDayIndex = (dayIndex) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + dayIndex);
    return date;
  };

  // Seleciona slot
  const handleSlotClick = (dayIndex, hour) => {
    const slotDate = getDateForDayIndex(dayIndex);

    setSelectedSlot({
      date: slotDate.toISOString().split("T")[0], // "YYYY-MM-DD"
      hour: String(hour).padStart(2, "0"), // "09", "10"...
    });
    setModalOpen(true);
  };

  // Cria consulta
  const handleCreateAppointment = async (patientId) => {
    if (!selectedSlot) return;

    const body = JSON.stringify({
      doctor: Number(doctorId),
      patient: Number(patientId),
      date: selectedSlot.date,
      start_time: `${selectedSlot.hour}:00`,
    });

    console.log("Tentando agendar:", body);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/appointments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      );

      if (!res.ok) {
        throw new Error(`Erro ao agendar: ${res.statusText}`);
      }

      setModalOpen(false);
      // *** CHAVE DA CORREÇÃO: Recarrega a lista de agendamentos após o sucesso ***
      await fetchAppointments();
      // O fetchAppointments irá atualizar o estado 'appointments',
      // forçando a re-renderização e a atualização das células.
    } catch (err) {
      console.error(err);
      alert(`Falha ao agendar: ${err.message}`);
    }
  };

  // Verifica se slot está ocupado
  const isOccupied = (dayIndex, hour) => {
    const slotDate = getDateForDayIndex(dayIndex);
    const dateStr = slotDate.toISOString().split("T")[0];
    const timeStr = `${String(hour).padStart(2, "0")}:00:00`;

    return appointments.some(
      (a) => a.date === dateStr && a.start_time === timeStr
    );
  };

  if (loading) return <div>Carregando agenda...</div>;

  // Formata a data de início e fim da semana para exibição
  const weekStartDisplay = currentWeekStart.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const weekEndDisplay = getDateForDayIndex(4).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div>
      {/* Controles de navegação da semana */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousWeek}
          className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
        >
          &lt; Semana Anterior
        </button>
        <h2 className="text-xl font-bold">
          Semana: {weekStartDisplay} - {weekEndDisplay}
        </h2>
        <button
          onClick={goToNextWeek}
          className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
        >
          Próxima Semana &gt;
        </button>
      </div>

      {/* Tabela da Agenda */}
      <div className="grid grid-cols-6 gap-2">
        <div></div>
        {DAYS.map((day, dayIndex) => {
          const date = getDateForDayIndex(dayIndex);
          const dayOfMonth = date.getDate();
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={day}
              className={`font-semibold text-center p-2 rounded ${
                isToday ? "bg-blue-100 text-blue-800" : ""
              }`}
            >
              {day} <br />
              <span className="text-sm font-normal">{dayOfMonth}</span>
            </div>
          );
        })}

        {WORK_HOURS.map((hour) => (
          <React.Fragment key={`row-${hour}`}>
            <div className="font-semibold text-right pr-2">{hour}h</div>
            {DAYS.map((day, dayIndex) => (
              <div
                key={`${day}-${hour}`}
                onClick={() =>
                  !isOccupied(dayIndex, hour) && handleSlotClick(dayIndex, hour)
                }
                className={`border p-2 text-center cursor-pointer transition-colors duration-150 ${
                  isOccupied(dayIndex, hour)
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-100 hover:bg-green-200"
                }`}
              >
                {isOccupied(dayIndex, hour) ? "Ocupado" : "Livre"}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {/* Modal de Agendamento */}
      {modalOpen && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="font-semibold mb-4">
              Agendar para {selectedSlot.date} às {selectedSlot.hour}:00
            </h3>
            <select id="patientSelect" className="w-full p-2 border mb-4">
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.person.fullname}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() =>
                  handleCreateAppointment(
                    document.getElementById("patientSelect").value
                  )
                }
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaTab;
