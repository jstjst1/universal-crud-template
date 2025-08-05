import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQueryClient } from 'react-query';
import { authAPI } from '../lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (data) => authAPI.updateProfile(data),
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success('Profile updated successfully!');
          setUser(data.data.data.user);
          setIsEditing(false);
          reset({
            username: data.data.data.user.username,
            email: data.data.data.user.email,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          queryClient.invalidateQueries('users');
        } else {
          toast.error(data?.data?.message || 'Failed to update profile');
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile');
      }
    }
  );

  const onSubmit = (data) => {
    // Prepare update data
    const updateData = {
      username: data.username,
      email: data.email
    };

    // Only include password fields if new password is provided
    if (data.newPassword) {
      if (data.newPassword !== data.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      updateData.currentPassword = data.currentPassword;
      updateData.newPassword = data.newPassword;
    }

    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const newPassword = watch('newPassword');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-primary-600" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {user.username}
              </h2>
              
              <div className="flex items-center justify-center mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <Shield className="h-4 w-4 mr-1" />
                  {user.role}
                </span>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {user.email}
                </div>
                
                <div className="flex items-center justify-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Account Information
                </h3>
                
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="form-label">
                      Username *
                    </label>
                    <input
                      type="text"
                      className={`form-input ${errors.username ? 'border-red-500' : ''} ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                      disabled={!isEditing}
                      {...register('username', {
                        required: 'Username is required',
                        minLength: {
                          value: 3,
                          message: 'Username must be at least 3 characters'
                        }
                      })}
                    />
                    {errors.username && (
                      <p className="form-error">{errors.username.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">
                      Email *
                    </label>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? 'border-red-500' : ''} ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                      disabled={!isEditing}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                    {errors.email && (
                      <p className="form-error">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Password Change Section */}
                {isEditing && (
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <Key className="h-5 w-5 mr-2" />
                      Change Password (Optional)
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="form-label">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            className={`form-input pr-10 ${errors.currentPassword ? 'border-red-500' : ''}`}
                            placeholder="Enter current password"
                            {...register('currentPassword', {
                              validate: (value) => {
                                if (newPassword && !value) {
                                  return 'Current password is required to change password';
                                }
                                return true;
                              }
                            })}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="form-error">{errors.currentPassword.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              className={`form-input pr-10 ${errors.newPassword ? 'border-red-500' : ''}`}
                              placeholder="Enter new password"
                              {...register('newPassword', {
                                minLength: {
                                  value: 6,
                                  message: 'Password must be at least 6 characters'
                                }
                              })}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {errors.newPassword && (
                            <p className="form-error">{errors.newPassword.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="form-label">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                              placeholder="Confirm new password"
                              {...register('confirmPassword', {
                                validate: (value) => {
                                  if (newPassword && value !== newPassword) {
                                    return 'Passwords do not match';
                                  }
                                  return true;
                                }
                              })}
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                          {errors.confirmPassword && (
                            <p className="form-error">{errors.confirmPassword.message}</p>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-500">
                        Leave password fields empty if you don't want to change your password.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                {isEditing && (
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isLoading}
                      className="btn-primary"
                    >
                      {updateProfileMutation.isLoading ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
