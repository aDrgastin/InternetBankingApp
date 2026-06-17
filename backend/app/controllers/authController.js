import * as authService from '../services/authService.js'
import { parseId } from '../utils/utils.js'

export async function login(req, res) {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
        return res.status(400).json({ status: 'MISSING_CREDENTIALS' });
    }

    try {
        const { token, userDTO } = await authService.login(username, password);
        return res.json({ status: 'SUCCESS', token, user: userDTO });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while logging in:', err);
        return res.status(500).end();
    }
}

export async function register(req, res) {
    const newUser = req.body ?? {};
    if (!newUser?.pin || !newUser?.username || !newUser?.password || !newUser?.firstName || !newUser?.lastName || !newUser?.email) {
        return res.status(400).json({ status: 'MISSING_CREDENTIALS' });
    }

    try {
        const { token, registeredUser } = await authService.register(newUser);
        return res.status(201).json({
            status: 'SUCCESS',
            token,
            user: registeredUser
        });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while registering:', err);
        return res.status(500).end();
    }
}

export async function me(req, res) {
    try {
        const user = await authService.getMe(res.locals.token.id);
        return res.json({ user });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while auto logging:', err);
        return res.status(500).end();
    }
}

export async function update(req, res) {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ status: 'INVALID_ID' });
    }
    const user = req.body ?? {};
    if (!user?.pin || !user?.username || !user?.firstName || !user?.lastName || !user?.email) {
        return res.status(400).json({ status: 'MISSING_DATA' });
    }

    try {
        const updated = await authService.updateUser(id, user);
        return res.json({ user: updated });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while updating a user:', err);
        return res.status(500).end();
    }
}

export async function getAllUsers(req, res) {
    try {
        const users = await authService.getAllUsers();
        return res.json({ status: 'SUCCESS', users });
    } catch (err) {
        if (err.statusCode) {
            return res.status(err.statusCode).json({ status: err.message });
        }
        console.error('Unknown error while fetching all users:', err);
        return res.status(500).end();
    }
}
