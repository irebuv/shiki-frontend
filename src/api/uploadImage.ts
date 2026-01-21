import api from '@/api/axios';

export async function uploadImage(url: string, file: File, fieldName = 'image') {
    const form = new FormData();
    form.append(fieldName, file);

    const { data } = await api.post(url, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
    });

    return data;
}
