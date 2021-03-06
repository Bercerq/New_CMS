import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ModulesService } from "./modules.service";
import {
  AddFieldsDTO,
  AddItemCategoryDTO,
  AddItemDTO,
  AddModuleDTO,
  DeleteFieldsDTO,
  DeleteItemCategoryDTO,
  DeleteItemDTO,
  DeleteItemFromWishListDTO,
  DeleteModuleDTO,
  EditFieldsDTO,
  EditFieldsOrderDTO,
  EditItemDTO,
  EditItemsDTO,
  EditItemsOrderDTO,
  EditModuleDTO,
  EditVariantsOrderDTO,
  GetItemCategoriesDTO,
  GetItemsCountDTO,
  GetItemVariantsDTO,
  ModuleIDDTO,
  ModuleNameDTO,
  PaginationDTO,
  ResponseItemDto,
  ResponseItemsDTO,
  SetVariantStockDTO,
  WishListDTO,
} from "./dto/modules.dto";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as uniqid from "uniqid";
import { Request } from "express";
import { LoggerGateway } from "../shared/logger/logger.gateway";
import { AuthGuard } from "@nestjs/passport";
import { join } from "path";
import { QueryDTO } from "../shared/dto/shared.dto";
import { FuserService } from "../shared/fuser/fuser.service";

export const module = "modules";

@Controller("modules")
export class ModulesController {
  constructor(
    private moduleService: ModulesService,
    private loggerGateway: LoggerGateway,
    private userService: FuserService
  ) {}

  @Get()
  @UseGuards(AuthGuard("jwt"))
  async getModules(@Query() userDTO: QueryDTO): Promise<Record<string, any>> {
    return this.moduleService.getModules(userDTO);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"))
  async addModule(
    @Body() userDTO: AddModuleDTO,
    @Req() req: Request
  ): Promise<Record<string, any>> {
    const { name, fields } = userDTO;
    if (name && name.includes(" ")) {
      throw new HttpException(
        "Name shouldn't have spaces!",
        HttpStatus.NOT_ACCEPTABLE
      );
    }
    if (fields) {
      const validated = await this.moduleService.validateFields(fields);
      if (validated) {
        userDTO.fields = validated;
        const result = await this.moduleService.createModule(userDTO);
        await this.loggerGateway.logAction(req, module);
        return result;
      }
    } else {
      const result = await this.moduleService.createModule(userDTO);
      await this.loggerGateway.logAction(req, module);
      return result;
    }
  }

  @Get("/items/:name")
  // @UseGuards(AuthGuard("jwt"))
  async getItems(
    @Param("name") userDTO: ModuleNameDTO,
    @Query() paginationDTO: PaginationDTO,
    @Headers("authorization") token: string
  ): Promise<Record<string, any>> {
    const verified = await this.userService.verifyToken(token.split(" ")[1]);

    if (!verified) {
      throw new HttpException("Link expired!", HttpStatus.NOT_FOUND);
    }

    const items = await this.moduleService.getItems(userDTO, paginationDTO);

    if (!items)
      throw new HttpException("Items not found!", HttpStatus.NOT_FOUND);

    return items;
  }

  @Get("/item")
  // @UseGuards(AuthGuard("jwt"))
  async getOne(
    @Body() getItem: GetItemCategoriesDTO
  ): Promise<Record<string, any>> {
    const item = await this.moduleService.getItemByID(
      getItem.moduleName,
      getItem.itemID
    );
    if (!item) {
      throw new HttpException("No item by this id", HttpStatus.NOT_FOUND);
    }

    return new ResponseItemDto(item);
  }

  @Get("/items/count")
  // @UseGuards(AuthGuard("jwt"))
  async getCount(
    @Query() getItem: GetItemsCountDTO
  ): Promise<Record<string, any>> {
    const item = await this.moduleService.getItemByID(
      getItem.moduleName,
      getItem.itemID
    );

    if (!item) {
      throw new HttpException("No item by this id", HttpStatus.NOT_FOUND);
    }

    const variant = item.variants.find((el) => {
      return el.variantID == getItem.variantID;
    });

    if (!variant) {
      throw new HttpException("No variant by this id", HttpStatus.NOT_FOUND);
    }

    if (variant.status == "disabled") {
      return { count: 0 };
    }

    return {
      count: variant.quantity,
    };
  }

  @Put("/item/wishlist")
  // @UseGuards(AuthGuard("jwt"))
  async addItemToWishList(
    @Body() userDTO: WishListDTO,
    @Req() req: Request,
    @Headers("authorization") token: string
  ) {
    const verified = await this.userService.verifyToken(token.split(" ")[1]);

    if (!verified) {
      throw new HttpException("Link expired!", HttpStatus.NOT_FOUND);
    }

    const result = await this.moduleService.addItemToWishList(
      verified.userID,
      userDTO
    );

    return { message: result };
  }

  @Delete("/item/wishlist")
  // @UseGuards(AuthGuard("jwt"))
  async removeItemFromWishList(
    @Body() userDTO: DeleteItemFromWishListDTO,
    @Req() req: Request,
    @Headers("authorization") token: string
  ) {
    const verified = await this.userService.verifyToken(token.split(" ")[1]);

    if (!verified) {
      throw new HttpException("Link expired!", HttpStatus.NOT_FOUND);
    }

    const result = await this.moduleService.removeItemFromWishList(
      verified.userID,
      userDTO
    );

    const wishlist = result.map((el) => {
      const newEl = new ResponseItemsDTO(el);
      newEl.isLiked = true;
      return newEl;
    });
    const totalCount = wishlist.length;

    if (!userDTO.limit && !userDTO.offset) {
      return { totalCount, items: wishlist };
    }

    if (!userDTO.limit) {
      return {
        totalCount,
        items: wishlist.slice(
          userDTO.offset > 0 ? userDTO.offset : wishlist.length
        ),
      };
    }

    if (!userDTO.offset) {
      return { totalCount, items: wishlist.slice(0, userDTO.limit) };
    }

    return {
      totalCount,
      items: wishlist.slice(
        userDTO.offset,
        userDTO.offset > 0 ? userDTO.offset + userDTO.limit + 1 : userDTO.limit
      ),
    };
  }

  @Put("/item/viewed")
  // @UseGuards(AuthGuard("jwt"))
  @HttpCode(HttpStatus.OK)
  async addItemToViewed(
    @Body() userDTO: WishListDTO,
    @Req() req: Request,
    @Headers("authorization") token: string
  ) {
    const verified = await this.userService.verifyToken(token.split(" ")[1]);

    if (!verified) {
      throw new HttpException("Link expired!", HttpStatus.NOT_FOUND);
    }

    return await this.moduleService.addItemToViewed(verified.userID, userDTO);
  }

  @Delete("/item")
  @UseGuards(AuthGuard("jwt"))
  async deleteItem(
    @Body() userDTO: DeleteItemDTO,
    @Req() req: Request,
    @Query() paginationDTO: PaginationDTO
  ) {
    const result = await this.moduleService.deleteItem(userDTO, paginationDTO);
    await this.loggerGateway.logAction(req, module);
    return result;
  }

  @Post("/item")
  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: ({ body: { data } }, file: Express.Multer.File, cb) =>
          cb(null, join(__dirname, "..", "uploads", "itemsImages")),
        filename: ({ body: { data } }, file, cb) =>
          cb(
            null,
            `${JSON.parse(data).moduleID}_${
              file.fieldname.split("-")[0]
            }${uniqid("_")}.${file.mimetype.split("/")[1]}`
          ),
      }),
    })
  )
  async createItem(
    @Body() userDTO: AddItemDTO,
    @Req() req: Request,
    @UploadedFiles() files: Express.Multer.File[],
    @Query() paginationDTO: PaginationDTO
  ): Promise<Record<string, any>> {
    const { body } = req;
    const result = await this.moduleService.addItem(
      userDTO,
      files,
      body,
      paginationDTO
    );
    await this.loggerGateway.logAction(req, module);
    return {
      count: result.count,
      items: result.items.map((el) => {
        return new ResponseItemsDTO(el);
      }),
    };
  }

  @Put("/item")
  // @UseGuards(AuthGuard("jwt"))
  // @UseInterceptors(
  //   AnyFilesInterceptor({
  //     storage: diskStorage({
  //       destination: ({ body: { data } }, file: Express.Multer.File, cb) =>
  //         cb(null, join(__dirname, "..", "uploads", "itemsImages")),
  //       filename: ({ body: { data } }, file, cb) =>
  //         cb(
  //           null,
  //           `${JSON.parse(data).moduleID}${uniqid("_")}.${
  //             file.mimetype.split("/")[1]
  //           }`
  //         ),
  //     }),
  //   })
  // )
  async editItem(
    @Body() userDTO: EditItemDTO,
    @Req() req: Request
    // @UploadedFile() files: Express.Multer.File[]
  ): Promise<Record<string, any>> {
    const files = [];
    const result = await this.moduleService.editItem(userDTO, files);
    await this.loggerGateway.logAction(req, module);
    return result;
  }

  @Put("/item/order")
  @UseGuards(AuthGuard("jwt"))
  async editItemsOrder(
    @Body() userDTO: EditItemsOrderDTO,
    @Req() req: Request
  ): Promise<Record<string, any>> {
    const result = await this.moduleService.editItemsOrder(userDTO);
    await this.loggerGateway.logAction(req, module);
    return result;
  }

  @Get("/item/categories/:moduleName/:itemID")
  @UseGuards(AuthGuard("jwt"))
  async getItemCategories(
    @Param() userDTO: GetItemCategoriesDTO
  ): Promise<Record<string, any>> {
    return this.moduleService.getItemCategories(userDTO);
  }

  @Put("/item/categories")
  @UseGuards(AuthGuard("jwt"))
  async addItemCategory(
    @Body() userDTO: AddItemCategoryDTO
  ): Promise<Record<string, any>> {
    return this.moduleService.addItemCategory(userDTO);
  }

  @Delete("/item/categories")
  @UseGuards(AuthGuard("jwt"))
  async deleteItemCategory(@Body() userDTO: DeleteItemCategoryDTO) {
    return this.moduleService.deleteItemCategory(userDTO);
  }

  // @Post("/item/variants")
  // @UseGuards(AuthGuard("jwt"))
  // @UseInterceptors(
  //   AnyFilesInterceptor({
  //     storage: diskStorage({
  //       destination: ({ body: { data } }, file: Express.Multer.File, cb) =>
  //         cb(null, join(__dirname, "..", "uploads", "itemsImages")),
  //       filename: ({ body: { data } }, file, cb) =>
  //         cb(
  //           null,
  //           `${JSON.parse(data).moduleID}${uniqid("_")}.${
  //             file.mimetype.split("/")[1]
  //           }`
  //         ),
  //     }),
  //   })
  // )
  // async addVariant(
  //   @Body() userDTO: AddVariantDTO,
  //   @Req() req: Request,
  //   // @UploadedFile() files: Express.Multer.File[]
  // ) {
  //   const result = await this.moduleService.addVariant(userDTO);
  //   // await this.loggerGateway.logAction(req, module);
  //
  //   return {variantID: result};
  // }

  // @Delete("/item/variants")
  // // @UseGuards(AuthGuard("jwt"))
  // async deleteVariant(@Body() userDTO: DeleteVariantDTO, @Req() req: Request) {
  //   const result = await this.moduleService.deleteVariant(userDTO);
  //   // await this.loggerGateway.logAction(req, module);
  //   return result;
  // }

  // @Put("/item/variants")
  // // @UseGuards(AuthGuard("jwt"))
  // @UseInterceptors(
  //   AnyFilesInterceptor({
  //     storage: diskStorage({
  //       destination: ({ body: { itemID } }, file: Express.Multer.File, cb) =>
  //         cb(null, join(__dirname, "..", "uploads", "itemsImages")),
  //       filename: ({ body: { itemID } }, file, cb) =>
  //         cb(
  //           null,
  //           `${itemID}${uniqid("_")}.${
  //             file.mimetype.split("/")[1]
  //           }`
  //         ),
  //     }),
  //   })
  // )
  // async editVariant(
  //   @Body() userDTO: EditVariantDTO,
  //   @Req() req: Request,
  //   @UploadedFile() files: Express.Multer.File[]
  // ): Promise<Record<string, any>> {
  //   const newfiles = [files];
  //
  //   const result = await this.moduleService.editVariant(userDTO, newfiles);
  //   // await this.loggerGateway.logAction(req, module);
  //   return result;
  // }

  @Put("/item/variants/order")
  @UseGuards(AuthGuard("jwt"))
  async editVariantsOrder(
    @Body() userDTO: EditVariantsOrderDTO,
    @Req() req: Request
  ): Promise<Record<string, any>> {
    const result = await this.moduleService.editVariantsOrder(userDTO);
    await this.loggerGateway.logAction(req, module);
    return result;
  }

  @Get("/item/variants/:moduleName/:itemID")
  async getItemVariants(
    @Param() userDTO: GetItemVariantsDTO,
    @Req() req: Request
  ): Promise<Record<string, any>> {
    return this.moduleService.getItemVariants(userDTO);
  }

  @Put("/items")
  async editItems(
    @Body() userDTO: EditItemsDTO,
    @Query() paginationDTO: PaginationDTO,
    @Req() req: Request
  ) {
    const result = await this.moduleService.editItems(userDTO, paginationDTO);
    await this.loggerGateway.logAction(req, module);
    return result;
  }

  @Put("/item/variants/stock")
  async setVariantStock(@Body() userDTO: SetVariantStockDTO) {
    return this.moduleService.setVariantStock(userDTO);
  }

  @Post("/upload")
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: ({ body: { moduleID } }, file: Express.Multer.File, cb) =>
          cb(null, join(__dirname, "..", "uploads", "itemsImages")),
        filename: ({ body: { moduleID } }, file, cb) =>
          cb(null, `${moduleID}${uniqid("_")}.${file.mimetype.split("/")[1]}`),
      }),
    })
  )
  async AddProduct(
    @UploadedFile() file: Express.Multer.File[],
    @Body() userDTO: ModuleIDDTO,
    @Req() req: Request
  ) {
    const result = await this.moduleService.uploadFile(userDTO, file);
    await this.loggerGateway.logAction(req, module);
    return result;
  }

  @Put()
  @HttpCode(HttpStatus.OK)
  async editModule(
    @Body() userDTO: EditModuleDTO,
    @Req() req: Request
  ): Promise<Record<string, any>> {
    const { name, fields } = userDTO;
    if (name && name.includes(" ")) {
      throw new HttpException(
        "Name should`nt have spaces!",
        HttpStatus.NOT_ACCEPTABLE
      );
    }
    if (fields) {
      const validated = await this.moduleService.validateFields(fields);
      if (validated) {
        userDTO.fields = validated;
        const result = await this.moduleService.editModule(userDTO);
        await this.loggerGateway.logAction(req, module);
        return result;
      }
    } else {
      const result = await this.moduleService.editModule(userDTO);
      await this.loggerGateway.logAction(req, module);
      return result;
    }
  }

  @Get("fields/:moduleName")
  async getFields(@Param("moduleName") userDTO: ModuleNameDTO) {
    return this.moduleService.getFields(userDTO);
  }

  @Post("fields")
  async addFields(
    @Body() userDTO: AddFieldsDTO,
    @Req() req: Request
  ): Promise<Record<string, any>> {
    const result = await this.moduleService.addField(userDTO);
    await this.loggerGateway.logAction(req, module);
    return result;
  }

  @Put("fields")
  @HttpCode(HttpStatus.OK)
  async editFields(
    @Body() userDTO: EditFieldsDTO,
    @Req() req: Request
  ): Promise<Record<string, any>> {
    const result = await this.moduleService.editField(userDTO);
    await this.loggerGateway.logAction(req, module);
    return result;
  }

  @Put("fields/order")
  @HttpCode(HttpStatus.OK)
  async editFieldsOrder(
    @Body() userDTO: EditFieldsOrderDTO,
    @Req() req: Request
  ): Promise<Record<string, any>> {
    const result = await this.moduleService.editFieldsOrder(userDTO);
    await this.loggerGateway.logAction(req, module);
    return result;
  }

  @Delete("fields/:fieldID")
  @HttpCode(HttpStatus.OK)
  async deleteFields(
    @Param("fieldID") userDTO: DeleteFieldsDTO,
    @Req() req: Request
  ) {
    const result = await this.moduleService.deleteField(userDTO);
    await this.loggerGateway.logAction(req, module);
    return result;
  }

  @Delete(":module")
  @HttpCode(HttpStatus.OK)
  async deleteModule(
    @Param("module") userDTO: DeleteModuleDTO,
    @Req() req: Request
  ) {
    const delModule = await this.moduleService.findModulesByID(userDTO);
    if (!delModule)
      throw new HttpException("Module not found!", HttpStatus.NOT_FOUND);
    await this.loggerGateway.logAction(req, module);
    return await this.moduleService.deleteModule(userDTO);
  }
}
