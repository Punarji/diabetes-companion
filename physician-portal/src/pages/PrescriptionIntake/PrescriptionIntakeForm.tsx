import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Chip, IconButton, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { apiClient } from '../../services/apiClient';

type MedicationRow = {
  name: string;
  dosage: string;
  frequency_label: string;
  instructions: string;
};

const DIET_RESTRICTIONS = ['Low Sugar', 'Low GI', 'No Alcohol'];
const EXERCISE_TYPES = ['Walking', 'Cycling', 'Swimming'];

export default function PrescriptionIntakeForm() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [medications, setMedications] = useState<MedicationRow[]>([
    { name: '', dosage: '', frequency_label: '', instructions: '' },
  ]);
  const [carbsPerDay, setCarbsPerDay] = useState('130');
  const [calories, setCalories] = useState('1500');
  const [restrictions, setRestrictions] = useState<string[]>(['Low Sugar', 'Low GI']);
  const [exerciseMinutes, setExerciseMinutes] = useState('150');
  const [exerciseTypes, setExerciseTypes] = useState<string[]>(['Walking', 'Cycling']);
  const [fastingTarget, setFastingTarget] = useState('110');
  const [postMealTarget, setPostMealTarget] = useState('160');
  const [hba1cTarget, setHba1cTarget] = useState('7.0');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const updateMedication = (index: number, field: keyof MedicationRow, value: string) => {
    setMedications((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addMedication = () => {
    setMedications((prev) => [...prev, { name: '', dosage: '', frequency_label: '', instructions: '' }]);
  };

  const toggleTag = (list: string[], setList: (v: string[]) => void, tag: string) => {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      await apiClient.post(`/api/v1/physician/patients/${patientId}/prescriptions`, {
        medications: medications
          .filter((m) => m.name.trim())
          .map((m) => ({
            name: m.name,
            dosage: m.dosage,
            frequency_label: m.frequency_label,
            instructions: m.instructions || null,
          })),
        dietary: {
          carbs_per_day_g: parseFloat(carbsPerDay) || 0,
          calories: parseFloat(calories) || 0,
          restrictions,
        },
        exercise: {
          minutes_per_week: parseFloat(exerciseMinutes) || 0,
          recommended_types: exerciseTypes,
        },
        glucose_targets: {
          fasting: parseFloat(fastingTarget) || 0,
          post_meal: parseFloat(postMealTarget) || 0,
          hba1c: parseFloat(hba1cTarget) || 0,
        },
        follow_up_date: followUpDate,
        generate_care_plan: true,
      });
      navigate(`/patients/${patientId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save prescription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ bgcolor: '#0B1D2A', color: 'white', px: 4, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: 'white' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>New Prescription</Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>Patient ID: {patientId}</Typography>
        </Box>
      </Box>

      <Box sx={{ p: 4, maxWidth: 700, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2, pb: 12 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>💊 Medications</Typography>
          {medications.map((med, i) => (
            <Box key={i} sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary">Drug Name</Typography>
              <TextField
                fullWidth size="small" value={med.name}
                onChange={(e) => updateMedication(i, 'name', e.target.value)}
                sx={{ mb: 1, bgcolor: 'white' }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Dosage</Typography>
                  <TextField
                    fullWidth size="small" value={med.dosage}
                    onChange={(e) => updateMedication(i, 'dosage', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">Frequency</Typography>
                  <TextField
                    fullWidth size="small" value={med.frequency_label}
                    onChange={(e) => updateMedication(i, 'frequency_label', e.target.value)}
                    sx={{ bgcolor: 'white' }}
                  />
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">Instructions</Typography>
              <TextField
                fullWidth size="small" value={med.instructions}
                onChange={(e) => updateMedication(i, 'instructions', e.target.value)}
                sx={{ bgcolor: 'white' }}
              />
            </Box>
          ))}
          <Button startIcon={<AddIcon />} onClick={addMedication} sx={{ bgcolor: 'primary.light', width: '100%' }}>
            Add Another Medication
          </Button>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>🍽️ Dietary Prescription</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Carbs / Day</Typography>
              <TextField fullWidth size="small" value={carbsPerDay} onChange={(e) => setCarbsPerDay(e.target.value)} InputProps={{ endAdornment: 'g' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Calories</Typography>
              <TextField fullWidth size="small" value={calories} onChange={(e) => setCalories(e.target.value)} InputProps={{ endAdornment: 'kcal' }} />
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">Restrictions</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            {DIET_RESTRICTIONS.map((tag) => (
              <Chip
                key={tag} label={tag}
                onClick={() => toggleTag(restrictions, setRestrictions, tag)}
                color={restrictions.includes(tag) ? 'primary' : 'default'}
              />
            ))}
          </Box>
        </Paper>

        <Button
          variant="contained" size="large"
          sx={{ py: 1.5, bgcolor: '#0E8074' }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          🚀 {submitting ? 'Generating...' : 'Generate Care Plan for Patient'}
        </Button>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>🏃 Exercise</Typography>
          <Typography variant="caption" color="text.secondary">Minutes / Week</Typography>
          <TextField fullWidth size="small" value={exerciseMinutes} onChange={(e) => setExerciseMinutes(e.target.value)} sx={{ mb: 2 }} InputProps={{ endAdornment: 'mins' }} />
          <Typography variant="caption" color="text.secondary">Recommended Types</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            {EXERCISE_TYPES.map((tag) => (
              <Chip
                key={tag} label={tag}
                onClick={() => toggleTag(exerciseTypes, setExerciseTypes, tag)}
                color={exerciseTypes.includes(tag) ? 'primary' : 'default'}
              />
            ))}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>🩸 Glucose Targets</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Fasting</Typography>
              <TextField fullWidth size="small" value={fastingTarget} onChange={(e) => setFastingTarget(e.target.value)} InputProps={{ startAdornment: '<' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">Post-meal</Typography>
              <TextField fullWidth size="small" value={postMealTarget} onChange={(e) => setPostMealTarget(e.target.value)} InputProps={{ startAdornment: '<' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">HbA1c</Typography>
              <TextField fullWidth size="small" value={hba1cTarget} onChange={(e) => setHba1cTarget(e.target.value)} InputProps={{ startAdornment: '<', endAdornment: '%' }} />
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, mb: 2 }}>📅 Follow-up</Typography>
          <Typography variant="caption" color="text.secondary">Next Appointment</Typography>
          <TextField
            fullWidth size="small" type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </Paper>
      </Box>
    </Box>
  );
}
