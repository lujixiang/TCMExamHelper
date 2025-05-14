import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Chip,
  Button,
  Stack,
  TextField,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { api } from '../../utils/api';
import QuestionCard from '../../components/QuestionCard';
import { MistakeItem } from '../../types/mistake';

const MistakeBook: React.FC = () => {
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    fetchMistakes();
  }, []);

  const fetchMistakes = async () => {
    try {
      const response = await api.get('/practice/mistakes');
      setMistakes(response.data.data);
    } catch (error) {
      console.error('获取错题记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'new' | 'reviewing' | 'mastered') => {
    try {
      await api.put(`/practice/mistakes/${id}/status`, { status });
      fetchMistakes();
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const handleSaveNote = async (id: string) => {
    try {
      await api.put(`/practice/mistakes/${id}/note`, { note: noteContent });
      setEditingNote(null);
      fetchMistakes();
    } catch (error) {
      console.error('保存笔记失败:', error);
    }
  };

  const handleDeleteMistake = async (id: string) => {
    try {
      await api.delete(`/practice/mistakes/${id}`);
      fetchMistakes();
    } catch (error) {
      console.error('删除错题失败:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          错题本
        </Typography>

        <Grid container spacing={3}>
          {mistakes.map((mistake) => (
            <Grid item xs={12} key={mistake.id}>
              <Card>
                <CardContent>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={mistake.subject}
                        color="primary"
                        size="small"
                      />
                      <Chip
                        label={mistake.chapter}
                        color="secondary"
                        size="small"
                      />
                      <Chip
                        label={`难度 ${mistake.difficulty}`}
                        color="default"
                        size="small"
                      />
                    </Stack>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteMistake(mistake.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <QuestionCard
                    question={{
                      content: mistake.question,
                      correctAnswer: mistake.correctAnswer,
                      yourAnswer: mistake.yourAnswer
                    }}
                    readOnly
                  />

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      错误时间: {new Date(mistake.date).toLocaleString()}
                    </Typography>
                    
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        笔记:
                      </Typography>
                      {editingNote === mistake.id ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                          />
                          <IconButton
                            color="primary"
                            onClick={() => handleSaveNote(mistake.id)}
                          >
                            <SaveIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => setEditingNote(null)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">
                            {mistake.notes || '暂无笔记'}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingNote(mistake.id);
                              setNoteContent(mistake.notes || '');
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant={mistake.status === 'new' ? 'contained' : 'outlined'}
                        onClick={() => handleUpdateStatus(mistake.id, 'new')}
                      >
                        未掌握
                      </Button>
                      <Button
                        size="small"
                        variant={mistake.status === 'reviewing' ? 'contained' : 'outlined'}
                        onClick={() => handleUpdateStatus(mistake.id, 'reviewing')}
                      >
                        复习中
                      </Button>
                      <Button
                        size="small"
                        variant={mistake.status === 'mastered' ? 'contained' : 'outlined'}
                        onClick={() => handleUpdateStatus(mistake.id, 'mastered')}
                      >
                        已掌握
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {mistakes.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography align="center" color="text.secondary">
                    暂无错题记录
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default MistakeBook; 