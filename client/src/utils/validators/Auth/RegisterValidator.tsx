interface ValidatorProps {
  firstname: string;
  lastname?: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword?: string;
  birthday?: string;
}

interface errorsProps {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  birthday?: string;
}

export const RegisterValidator = (values: ValidatorProps) => {
  const errors: errorsProps = {};

  const emailReg =
    !/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/g.test(
      values.email
    );

  const passwordRegSpaces = /(\s)/g.test(values.password);
  const passwordRegCyrillic = /[^a-zA-Z0-9]/g.test(values.password);

  // EMAIL

  if (!values.email) {
    errors.email = "Required";
  } else if (emailReg) {
    errors.email = "Invalid email address";
  }

  // PASSWORD
  (!values.password && (errors.password = "Required")) ||
    (passwordRegSpaces &&
      (errors.password = "Password must not contain spaces ")) ||
    (values?.password?.length < 8 &&
      (errors.password =
        "Minimum 8 characters, at least 1 letter and 1 number")) ||
    (passwordRegCyrillic &&
      (errors.password = "Password must not contain cyrillic "));

  // CONFIRM PASSWORD
  !values.confirmPassword &&
    (errors.confirmPassword = "Required") &&
    values.password !== values.confirmPassword &&
    (errors.confirmPassword = "Passwords must match");

  // first name

  if (!values.firstname) errors.firstname = "Required";
  else if (values?.firstname?.length > 30)
    errors.firstname = "Must have a maximum of 30 characters";
  else if (!values.firstname.match("^[a-zA-Z]+$"))
    errors.firstname = "The first name must contain only letters";
  else if (!values.firstname.match(/^[A-Z]/))
    errors.firstname = "First letter must be in upper case";

  //last name

  if (values?.lastname) {
    if (values?.lastname?.length > 30)
      errors.lastname = "Must have a maximum of 30 characters";
    else if (!values?.lastname?.match("^[a-zA-Z]+$"))
      errors.lastname = "The last name must contain only letters";
    else if (!values?.lastname?.match(/^[A-Z]/))
      errors.lastname = "First letter must be in upper case";
  }
  // Phone
  if (values?.phone) {
    if (values?.phone?.match(/[^0-9]/))
      errors.phone = "The phone number must contain only numbers";
    else if (!values?.phone?.match(/^\+?\d[0-9]{9,15}$/))
      errors.phone = "Invalid Phone!";
  }
  // BirthDay
  if (values?.birthday) {
    if (new Date(values?.birthday) >= new Date(Date.now())) {
      errors.birthday = "Wrong date";
    } else if (new Date(values?.birthday) < new Date("1910-01-01")) {
      errors.birthday = "Wrong date";
    }
  }
  return errors;
};
