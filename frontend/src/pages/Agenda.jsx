import React, { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AgendaPage = () => {
  const token = localStorage.getItem("authToken");

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [notes, setNotes] = useState("");

  // 🟦 Horários fixos do MVP
  const horarios = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
  ];

  useEffect(() => {
    fetchDoctors();
    fetchPatients();
  }, []);

  const fetchDoctors = async () => {
    const r = await fetch(`${API_BASE_URL}/doctors/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDoctors(await r.json());
  };

  const fetchPatients = async () => {
    const r = await fetch(`${API_BASE_URL}/patients/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPatients(await r.json());
  };

  const loadAgenda = async () => {
    if (!selectedDoctor || !selectedDate) return;

    const r = await fetch(
      `${API_BASE_URL}/appointments/?doctor=${selectedDoctor}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await r.json();
    console.log(data);

    const ofDay = data.filter((a) => a.date === selectedDate);
    setAppointments(ofDay);
  };

  const openSlot = (time) => {
    setSelectedSlot(time);
    setModalOpen(true);
  };

  const createAppointment = async () => {
    const payload = {
      doctor: parseInt(selectedDoctor),
      patient: parseInt(selectedPatient),
      date: selectedDate,
      start_time: selectedSlot,
      notes,
    };

    const r = await fetch(`${API_BASE_URL}/appointments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (r.ok) {
      setModalOpen(false);
      setSelectedPatient("");
      setNotes("");
      loadAgenda();
    } else {
      alert("Erro ao marcar consulta");
    }
  };

  const bookedAt = (time) => {
    return appointments.find((a) => a.start_time === time);
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>

      {/* Filtros */}
      <div className="flex space-x-4 items-center">
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="">Selecione o profissional</option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.person.fullname}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded-lg"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <button
          onClick={loadAgenda}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Carregar
        </button>
      </div>

      {/* Grade de horários */}
      {selectedDoctor && selectedDate && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {horarios.map((time) => {
            const booked = bookedAt(time);

            return (
              <div
                key={time}
                className={`p-4 border rounded-xl shadow-sm cursor-pointer transition ${
                  booked
                    ? "bg-red-100 border-red-300"
                    : "bg-green-100 border-green-300 hover:bg-green-200"
                }`}
                onClick={() => !booked && openSlot(time)}
              >
                <p className="text-lg font-bold">{time}</p>

                {booked ? (
                  <p className="text-sm text-red-700">
                    {booked.patient_person_fullname || "Ocupado"}
                  </p>
                ) : (
                  <p className="text-sm text-green-700">Disponível</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de criação */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 space-y-4">
            <h2 className="text-xl font-bold">
              Marcar consulta — {selectedSlot}
            </h2>

            <select
              className="border p-2 w-full rounded-lg"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="">Selecione o paciente</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.person.fullname}
                </option>
              ))}
            </select>

            <textarea
              className="border p-2 w-full rounded-lg"
              rows="3"
              placeholder="Observações (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={createAppointment}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaPage;
