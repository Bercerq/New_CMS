import { FC } from "react";
import { useSelector } from "react-redux";
import { Form } from "react-final-form";

import { errorMessageSelector } from "@redux/selectors/error";
import { loaderStatusSelector } from "@redux/selectors/loader";

import {
  ButtonsData,
  ResetPasswordFields,
} from "@utils/constants/AuthField/ResetPasswordFields/ResetPasswordFields";
import { Loader } from "@utils/constants/Loader/Loader";
import { ResetPasswordValidator } from "@utils/validators/Auth/ResetPasswordValidator";

import { IFormValues } from "@modules/Auth/ResetPassword";

import FormField from "@components/FormField/FormField";
import { AuthButtonContainer } from "@components/Auth/AuthButtons/AuthButtonsContainer/AuthButtonsContainer";

import {
  ButtonContainer,
  ErrorMessage,
  FieldCustom,
  FormContainer,
} from "@modules/Auth/styled/styled";

interface LoginProps {
  onSubmit: (value: IFormValues) => void;
}

export const ResetPasswordForm: FC<LoginProps> = ({ onSubmit }) => {
  const { LoginButton, RegisterButton, description, path } = ButtonsData;
  const { LoaderCircularrButton } = Loader;
  const errorMessage = useSelector(errorMessageSelector);
  const loaderStatus = useSelector(loaderStatusSelector);
  return (
    <Form
      onSubmit={onSubmit}
      validate={ResetPasswordValidator}
      render={({ handleSubmit }) => (
        <FormContainer>
          <form onSubmit={handleSubmit}>
            <ErrorMessage>{errorMessage}</ErrorMessage>
            {ResetPasswordFields.map(({ type, name, label, icon }, index) => (
              <FieldCustom
                key={index}
                type={type}
                name={name}
                label={label}
                variant="outlined"
                component={FormField}
              >
                {icon}
              </FieldCustom>
            ))}
            <ButtonContainer>
              <AuthButtonContainer
                description={description}
                button={LoginButton}
                Loader={LoaderCircularrButton}
                secondButton={RegisterButton}
                path={path}
                loaderStatus={loaderStatus}
              />
            </ButtonContainer>
          </form>
        </FormContainer>
      )}
    />
  );
};
