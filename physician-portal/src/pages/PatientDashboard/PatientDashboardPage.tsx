import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Avatar, Chip, IconButton, InputAdornment,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../store/authContext';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  teal: { bg: '#E6F7F4', text: '#0E8074' },
  red: { bg: '#FEE2E2', text: '#EF4444' },
  green: { bg: '#DCFCE7', text: '#16A34A' },
};

export default function PatientDashboardPage() {
  const { physician, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient
      .get('/api/v1/physician/patients')
      .then(({ data }) => setData(data))
      .catch(() => setData({ total_patients: 0, alerts_today: 0, on_track_count: 0, patients: [] }));
  }, []);

  if (!data) return null;

  const filtered = data.patients.filter((p: any) =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ bgcolor: '#0B1D2A', color: 'white', px: 4, py: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{physician?.full_name}</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>Endocrinologist</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>👨‍⚕️</Avatar>
          <IconButton onClick={logout} sx={{ color: 'white' }}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ p: 4, maxWidth: 1000, mx: 'auto' }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <StatCard value={data.total_patients} label="Total Patients" color="text.primary" />
          <StatCard value={data.alerts_today} label="Alerts Today" color="error.main" />
          <StatCard value={data.on_track_count} label="On Track" color="primary.main" />
        </Box>

        <TextField
          fullWidth
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3, bgcolor: 'white' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="disabled" />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>My Patients</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map((patient: any) => {
            const colors = STATUS_COLORS[patient.status_color] || STATUS_COLORS.teal;
            const needsAttention = patient.status_color === 'red';
            return (
              <Paper
                key={patient.id}
                elevation={0}
                onClick={() => navigate(`/patients/${patient.id}`)}
                sx={{
                  p: 2.5, display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer',
                  border: '1px solid', borderColor: 'divider',
                  borderLeft: needsAttention ? '4px solid #EF4444' : '1px solid',
                  borderLeftColor: needsAttention ? '#EF4444' : 'divider',
                  '&:hover': { boxShadow: 1 },
                }}
              >
                <Avatar sx={{ bgcolor: colors.bg, color: colors.text, fontWeight: 700 }}>
                  {patient.initials}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{patient.full_name}</Typography>
                  <Typography variant="body2" color="text.secondary">{patient.condition_label}</Typography>
                  <Chip
                    label={patient.status_label}
                    size="small"
                    sx={{ mt: 0.5, bgcolor: colors.bg, color: colors.text, fontWeight: 600 }}
                  />
                </Box>
                {patient.hba1c_latest != null && (
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography sx={{ fontWeight: 700, color: colors.text }}>
                      {patient.hba1c_latest}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">HbA1c</Typography>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <Paper elevation={0} sx={{ flex: 1, p: 2.5, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color }}>{value}</Typography>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
    </Paper>
  );
}
