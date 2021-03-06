import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GuardsService } from './guards.service';

@Injectable()
export class AddPagesGuard implements CanActivate {
  constructor(private guardService: GuardsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;

    const userGroup = await this.guardService.pagesAdd(user);

    if (userGroup === true) {
      return true;
    } else {
      response.redirect('/guard');
      return false;
    }
  }
}

@Injectable()
export class AddUsersGuard implements CanActivate {
  constructor(private guardService: GuardsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;

    const userGroup = await this.guardService.usersAdd(user);

    if (userGroup === true) {
      return true;
    } else {
      response.redirect('/guard');
      return false;
    }
  }
}

@Injectable()
export class AddGroupsGuard implements CanActivate {
  constructor(private guardService: GuardsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const user = request.user;

    const userGroup = await this.guardService.groupsAdd(user);

    if (userGroup === true) {
      return true;
    } else {
      response.redirect('/guard');
      return false;
    }
  }
}
