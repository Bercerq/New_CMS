import { AuthRoutes } from '@utils/enums/routes';
import { Icons } from '../icon';

export const ResetFields = [
    {
        type: 'text',
        name: 'email',
        label: 'Email',
        icon: Icons.EmailIcon
    }
];

export const ButtonsData = {
    buttonIcon: Icons.MailIcon,
    buttonText: 'Send email',

    linkText: 'Log in',
    description: 'Have an account ?',
    path: AuthRoutes.LOGIN
};

export const MainText = {
    title: 'Reset Password',
    description: 'To reset your password enter your email'
};
