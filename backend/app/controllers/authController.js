import * as authService from '../services/authService.js'

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
    return res.json({ user: req.decoded });
}