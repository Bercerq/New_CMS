import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  HttpCode, Get, Param, Put,
} from "@nestjs/common";
import {
  NewPasswordDTO,
  EmailDTO,
  LoginDTO,
  RegisterDTO
} from "./dto/auth.dto";
import { FauthService } from "./fauth.service";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { TokenDTO } from "../groups/dto/groups.dto";
import {Fuser} from "../types/fuser";
import {FuserService} from "../shared/fuser/fuser.service";
import {ResponseUserDto} from "../fusers/dto/fusers.dto";

@Controller("fauth")
export class FauthController {
  userID;
  constructor(
      @InjectModel("Fuser") private userModel: Model<Fuser>,
      private userService: FuserService,
      private authService: FauthService
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() userDTO: LoginDTO): Promise<Record<string, any>> {
    const user = await this.userService.login(userDTO);

    const payload = {
      userID: user.userID,
    };

    const token = await this.authService.signPayload(payload, "24h");

    // const respUser = new ResponseUserDto(user);

    return { accessToken: `Bearer ${token}`,
      user: {
        userID: user.userID,
        main: user.userMain,
        contacts: user.contacts,
        address: user.shippingAddress
      },
      message: "Login successfully"

    };
  }

  // @Post("checkEmail")
  // @HttpCode(HttpStatus.FOUND)
  // async checkEmail(@Body() userDTO: EmailDTO): Promise<Record<string, any>> {
  //   const candidate = await this.userModel.findOne({ email: userDTO.email });
  //
  //   if (!candidate) {
  //     throw new HttpException({ status: false }, HttpStatus.NOT_FOUND);
  //   }
  //
  //   return { status: true };
  // }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() userDTO: RegisterDTO): Promise<Record<string, any>> {
    const candidate = await this.userService.findUser(userDTO.email);

    if (candidate) {
      throw new HttpException(`User is already exists!`, HttpStatus.CONFLICT);
    }

    const newUser = {
      userMain: {
        firstName: userDTO.firstName,
        lastName: userDTO.lastName,
        sex: userDTO.sex || "",
      },
      contacts: {
        email: userDTO.email,
        phone: userDTO.phone || "",
      },
      shippingAddress: {
        address1: userDTO.address1 || "",
        address2: userDTO.address2 || ""
      },
      password: userDTO.password
    }

    const user = await this.userService.register(newUser);

    const payload = {
      userID: user.userID,
      email: user.contacts.email,
      confirmed: user.confirmed,
    };

    const hash = this.authService.signPayload(payload, "48h");
    await this.authService.sendEmail(user.userID, hash);
    return { message: 'Confirming message has been sent to the email' }
  }

  @Get("register/confirm/:token")
  @HttpCode(HttpStatus.ACCEPTED)
  async confirmUser(@Param('token') token: string): Promise<string> {

    const verified = await this.userService.verifyToken(token);

    if (verified) {
      const user = await this.userService.findUserByID(verified.userID);

      if (user && !user.confirmed) {
        await this.userService.setAction(verified.userID);
        return this.userService.confirmUser(verified.userID);
      } else {
        throw new HttpException("Link expired!", HttpStatus.NOT_FOUND);
      }
    } else {
      throw new HttpException("Link expired!", HttpStatus.NOT_FOUND);
    }
  }

  @Post("forgotPassword")
  @HttpCode(HttpStatus.CREATED)
  async sendResetEmail(
      @Body() userDTO: EmailDTO
  ): Promise<Record<string, any>> {
    const { email } = userDTO;
    const candidate = await this.userService.findUser(email);

    if (candidate) {
      await this.userService.setAction(candidate.userID);
      const user = await this.userService.findUserByID(candidate.userID);

      const payload = {
        userID: user.userID,
        email: user.email,
        actionDate: user.actionDate,
      };

      const hash = await this.authService.signPayload(payload, "48h");

      return this.authService.sendResetEmail(user.userID, hash);
    } else {
      throw new HttpException("User not found!", HttpStatus.NOT_FOUND);
    }
  }

  @Put("password/reset")
  @HttpCode(HttpStatus.ACCEPTED)
  async resetPassword(
      @Body() userDTO: NewPasswordDTO
  ): Promise<Record<string, any>> {
    const { token, newPassword, newPasswordConfirm } = userDTO;

    if (newPassword === newPasswordConfirm) {
      const verified = await this.userService.verifyToken(token);

      const user = await this.userService.findUserByID(verified.userID);

      if (verified && Date.parse(verified.actionDate) === +user.actionDate) {
        await this.userService.setAction(verified.userID);
        return this.authService.changePassword(verified.userID, newPassword);
      } else {
        throw new HttpException(
            { message: "Link expired!" },
            HttpStatus.BAD_REQUEST
        );
      }
    } else {
      throw new HttpException(
          { message: "Passwords don`t match!" },
          HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("googleAuth")
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() userDTO: TokenDTO): Promise<Record<string, any>> {
    const { token } = userDTO;

    const user = await this.authService.googleAuth(token);

    const payload = {
      userID: user['userID'],
      email: user.contacts['email'],
      actionDate: user['actionDate'],
    };

    const newToken = await this.authService.signPayload(payload, "24h");

    const respUser = new ResponseUserDto(user);

    return { accessToken: `Bearer ${newToken}`,
      user: {
        userID: user.userID,
        main: user.userMain,
        contacts: user.contacts,
        address: user.shippingAddress
      },
      message: "Login successfully"
    };

  }

  @Get("/validateToken/:token")
  @HttpCode(HttpStatus.OK)
  async confirmGoogleToken(@Param('token') token: string): Promise<void> {

    try{
      const verified = await this.userService.verifyToken(token);
    }
    catch (err) {
      throw new HttpException("Token is invalid", HttpStatus.BAD_REQUEST);
    }
  }

  @Post("facebookAuth")
  @HttpCode(HttpStatus.OK)
  async facebookAuth(@Body() userDTO: TokenDTO): Promise<Record<string, any>> {
    const { token } = userDTO;
    const user = await this.authService.facebookAuth(token);

    const payload = {
      userID: user['userID'],
      email: user.contacts['email'],
      actionDate: user['actionDate'],
    };

    const newToken = await this.authService.signPayload(payload, "24h");
    const respUser = new ResponseUserDto(user);

    return { accessToken: `Bearer ${newToken}`,
      user: {
        userID: user['userID'],
        main: user.userMain,
        contacts: user.contacts,
        address: user.shippingAddress
      },
      message: "Login successfully"
    };

  }
}
