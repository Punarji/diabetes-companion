import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, IconButton, TextField,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { apiClient } from '../../services/apiClient';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  green: { bg: '#DCFCE7', text: '#16A34A' },
  amber: { bg: '#FEF3C7', text: '#D97706' },
  red: { bg: '#FEE2E2', text: '#EF4444' },
};

export default function PatientDetailPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiClient.get(`/api/v1/physician/patients/${patientId}/report`).then(({ data }) => {
      setReport(data);
      setNotes(data.doctor_notes || '');
    });
  }, [patientId]);

  const handleUpdatePlan = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`/api/v1/physician/patients/${patientId}/notes`, { doctor_notes: notes });
    } finally {
      setSaving(false);
    }
  };

  if (!report) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ bgcolor: '#0B1D2A', color: 'white', px: 4, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Patient Report — {report.report_month_label}
        </Typography>
      </Box>

      <Box sx={{ p: 4, maxWidth: 700, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography sx={{ fontWeight: 700 }}>Patient Overview</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <OverviewStat
            value={report.hba1c_latest != null ? `${report.hba1c_latest}%` : '--'}
            label="HbA1c"
            bg="#FEF3C7" color="#D97706"
          />
          <OverviewStat
            value={`${report.medication_adherence_percent}%`}
            label="Med Adherence"
            bg="#E6F7F4" color="#0E8074"
          />
          <OverviewStat
            value={`${report.time_in_range_percent}%`}
            label="Time in Range"
            bg="#DCFCE7" color="#16A34A"
          />
        </Box>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>🩸 Glucose Patterns</Typography>
          {report.glucose_patterns.map((row: any, i: number) => {
            const c = STATUS_COLORS[row.status_color] || STATUS_COLORS.green;
            return (
              <Box
                key={i}
                sx={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  py: 1.5, borderBottom: i < report.glucose_patterns.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography color="text.secondary">{row.label}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontWeight: 700 }}>{row.value}</Typography>
                  <Box sx={{ bgcolor: c.bg, color: c.text, px: 1.5, py: 0.3, borderRadius: 5, fontSize: 13, fontWeight: 600 }}>
                    {row.status_label}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>📝 Doctor Notes</Typography>
          <TextField
            fullWidth multiline minRows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add clinical notes about this patient's progress..."
          />
        </Paper>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" fullWidth sx={{ py: 1.5 }}>
            📄 Export PDF
          </Button>
          <Button
            variant="contained" fullWidth sx={{ py: 1.5, bgcolor: '#0E8074' }}
            onClick={handleUpdatePlan}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Update Plan'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function OverviewStat({ value, label, bg, color }: { value: string; label: string; bg: string; color: string }) {
  return (
    <Box sx={{ flex: 1, bgcolor: bg, borderRadius: 2, p: 2, textAlign: 'center' }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}
