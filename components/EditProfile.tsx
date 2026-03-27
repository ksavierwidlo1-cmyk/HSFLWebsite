"use client";

import { useState } from "react";
import { Edit2, Save, X } from "lucide-react";

interface EditProfileProps {
  player: any;
  isOwnProfile: boolean;
  onSave: (updates: any) => Promise<void>;
}

export default function EditProfile({ player, isOwnProfile, onSave }: EditProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: player.description || "",
  });

  if (!isOwnProfile) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      description: player.description || "",
    });
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-2 px-4 py-2 bg-eba-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Edit2 className="w-4 h-4" />
        <span>Edit Profile</span>
      </button>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            maxLength={500}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-eba-blue focus:border-transparent text-gray-900 dark:text-white resize-none"
            placeholder="Tell us about yourself... (Max 500 characters)"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formData.description.length}/500 characters
          </p>
        </div>
      </div>
    </div>
  );
}
