import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';

interface WorkExperience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description: string;
  current: boolean;
}

interface ExperienceManagerProps {
  experiences: WorkExperience[];
  onChange: (experiences: WorkExperience[]) => void;
  isEditing: boolean;
}

export function ExperienceManager({ experiences, onChange, isEditing }: ExperienceManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newExperience, setNewExperience] = useState<WorkExperience>({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    description: '',
    current: false
  });

  const addExperience = () => {
    if (newExperience.company && newExperience.position) {
      onChange([...experiences, newExperience]);
      setNewExperience({
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        description: '',
        current: false
      });
    }
  };

  const updateExperience = (index: number, updatedExp: WorkExperience) => {
    const updated = [...experiences];
    updated[index] = updatedExp;
    onChange(updated);
    setEditingIndex(null);
  };

  const removeExperience = (index: number) => {
    onChange(experiences.filter((_, i) => i !== index));
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{exp.position}</h4>
                <p className="text-muted-foreground">{exp.company}</p>
                <p className="text-sm text-muted-foreground">
                  {exp.start_date} - {exp.current ? 'Atual' : exp.end_date}
                </p>
                <p className="text-sm mt-2">{exp.description}</p>
              </div>
              {exp.current && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Atual
                </span>
              )}
            </div>
          </Card>
        ))}
        {experiences.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma experiência profissional cadastrada
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Existing Experiences */}
      {experiences.map((exp, index) => (
        <Card key={index} className="p-4">
          {editingIndex === index ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Empresa</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(index, { ...exp, company: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Cargo</Label>
                  <Input
                    value={exp.position}
                    onChange={(e) => updateExperience(index, { ...exp, position: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={exp.start_date}
                    onChange={(e) => updateExperience(index, { ...exp, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Data de Fim</Label>
                  <Input
                    type="date"
                    value={exp.end_date || ''}
                    onChange={(e) => updateExperience(index, { ...exp, end_date: e.target.value })}
                    disabled={exp.current}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`current-${index}`}
                  checked={exp.current}
                  onCheckedChange={(checked) => 
                    updateExperience(index, { 
                      ...exp, 
                      current: checked as boolean,
                      end_date: checked ? '' : exp.end_date
                    })
                  }
                />
                <Label htmlFor={`current-${index}`}>Trabalho atual</Label>
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(index, { ...exp, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setEditingIndex(null)}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingIndex(null)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{exp.position}</h4>
                <p className="text-muted-foreground">{exp.company}</p>
                <p className="text-sm text-muted-foreground">
                  {exp.start_date} - {exp.current ? 'Atual' : exp.end_date}
                </p>
                <p className="text-sm mt-2">{exp.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingIndex(index)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeExperience(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}

      {/* Add New Experience */}
      <Card className="p-4 border-dashed border-2">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Experiência
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Empresa</Label>
                <Input
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input
                  value={newExperience.position}
                  onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                  placeholder="Título do cargo"
                />
              </div>
              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={newExperience.start_date}
                  onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Data de Fim</Label>
                <Input
                  type="date"
                  value={newExperience.end_date || ''}
                  onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                  disabled={newExperience.current}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="current-new"
                checked={newExperience.current}
                onCheckedChange={(checked) => 
                  setNewExperience({ 
                    ...newExperience, 
                    current: checked as boolean,
                    end_date: checked ? '' : newExperience.end_date
                  })
                }
              />
              <Label htmlFor="current-new">Trabalho atual</Label>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={newExperience.description}
                onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                placeholder="Descreva suas responsabilidades e conquistas..."
                rows={3}
              />
            </div>
            <Button onClick={addExperience} disabled={!newExperience.company || !newExperience.position}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Experiência
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
