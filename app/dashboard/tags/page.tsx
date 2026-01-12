'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { tagService, type TagWithCount, type CreateTagRequest, type UpdateTagRequest } from '@/lib/api';

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithCount | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#3B82F6' });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setIsLoading(true);
      const data = await tagService.getAll();
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        const updateData: UpdateTagRequest = {};
        if (formData.name !== editingTag.name) updateData.name = formData.name;
        if (formData.color !== editingTag.color) updateData.color = formData.color;
        await tagService.update(editingTag.id, updateData);
      } else {
        const createData: CreateTagRequest = {
          name: formData.name,
          color: formData.color,
        };
        await tagService.create(createData);
      }
      setIsDialogOpen(false);
      setEditingTag(null);
      setFormData({ name: '', color: '#3B82F6' });
      loadTags();
    } catch (error) {
      console.error('Failed to save tag:', error);
      alert('Failed to save tag');
    }
  };

  const handleEdit = (tag: TagWithCount) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    
    try {
      await tagService.delete(id);
      loadTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('Failed to delete tag');
    }
  };

  const handleCreateNew = () => {
    setEditingTag(null);
    setFormData({ name: '', color: '#3B82F6' });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="p-8">Loading tags...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tags</h1>
          <p className="text-muted-foreground mt-2">
            Organize your websites with custom tags
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Tag
        </Button>
      </div>

      {tags.length === 0 ? (
        <Card className="p-12 text-center">
          <TagIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tags yet</h3>
          <p className="text-muted-foreground mb-4">
            Create tags to organize your websites
          </p>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Tag
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <div>
                    <h3 className="font-semibold">{tag.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tag.website_count} {tag.website_count === 1 ? 'website' : 'websites'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(tag)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(tag.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingTag ? 'Edit Tag' : 'Create Tag'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Tag name"
                  required
                  maxLength={50}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Color</label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#3B82F6"
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTag ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Dialog>
    </div>
  );
}
