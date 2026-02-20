import api from '@/api/axios';
import { toast } from '@/components/custom/Sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
        const withResponse = error as {
            response?: {
                data?: {
                    message?: string;
                    errors?: Record<string, string[]>;
                };
            };
        };

        const apiMessage = withResponse.response?.data?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim() !== '') {
            return apiMessage;
        }

        const firstFieldError = withResponse.response?.data?.errors
            ? Object.values(withResponse.response.data.errors)[0]?.[0]
            : null;

        if (typeof firstFieldError === 'string' && firstFieldError.trim() !== '') {
            return firstFieldError;
        }
    }

    return fallback;
}

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string } | undefined)?.from ?? '/';

    const onAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (!file) {
            setAvatar(null);
            return;
        }

        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
            toast.error('Avatar must be JPG, PNG or WEBP.');
            event.target.value = '';
            return;
        }

        if (file.size > MAX_AVATAR_BYTES) {
            toast.error('Avatar max size is 2MB.');
            event.target.value = '';
            return;
        }

        setAvatar(file);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const normalizedName = name.trim();
        const normalizedEmail = email.trim();

        if (!normalizedName) {
            toast.error('Name is required.');
            return;
        }

        if (!normalizedEmail) {
            toast.error('Email is required.');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must br at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', normalizedName);
            formData.append('email', normalizedEmail);
            formData.append('password', password);
            if (avatar) {
                formData.append('avatar', avatar);
            }

            await api.post('/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success('Account created.');
            navigate(from, { replace: true });
        } catch (error) {
            toast.error(getErrorMessage(error, 'Registration failed.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex w-full flex-1 items-center justify-center">
            <form
                onSubmit={handleRegister}
                className="flex flex-col gap-3 rounded-2xl bg-background p-8 shadow-lg"
            >
                <h1 className="mb-4 text-center text-2xl font-bold">Sign up</h1>

                <div className="space-y-1">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="name"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                </div>

                <div className='space-y-1'>
                    <Label htmlFor="avatar">Avatar (optional)</Label>
                    <Input
                        id="avatar"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={onAvatarChange}
                        className='cursor-pointer'
                    />
                    {avatar ? (
                        <p className="text-xs text-muted-foreground">{avatar.name}</p>
                    ) : null}
                </div>
                
                <Button type="submit" className="mt-2 w-full" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Create account'}
                </Button>
            </form>
        </div>
    );
}
