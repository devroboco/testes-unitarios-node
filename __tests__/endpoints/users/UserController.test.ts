import request from "supertest";
import { App } from "../../../src/app";
import { IUser } from "../../../src/interfaces/IUser";
import { IUserResponse } from "../../../src/interfaces/IUserResponse";
import { UserRepository } from "../../../src/endpoints/users/userRepository";

// Cria uma instância da aplicação para executar os testes
const app = new App().server.listen(8081);

describe("UserController", () => {
  afterAll((done) => {
    // Fechar o servidor após os testes
    app.close(done);
  });

  it("Deve retornar a lista de usuários corretamente", async () => {
    const mockUsers: IUser[] = [
      {
        id: 1,
        name: "Naruto",
        age: 10,
      },
      {
        id: 2,
        name: "Sasuke",
        age: 18,
      },
      {
        id: 3,
        name: "Kakashi",
        age: 50,
      },
    ];

    const expectedUsers: IUserResponse[] = [
      {
        id: 1,
        name: "Naruto",
        age: 10,
        isOfAge: false,
      },
      {
        id: 2,
        name: "Sasuke",
        age: 18,
        isOfAge: true,
      },
      {
        id: 3,
        name: "Kakashi",
        age: 50,
        isOfAge: true,
      },
    ];

    jest.spyOn(UserRepository.prototype, "list").mockReturnValueOnce(mockUsers);

    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expectedUsers);
  });

  it("Deve retornar uma lista de usuários vazia", async () => {
    const mockUsers: IUser[] = [];
    const expectedUsers: IUserResponse[] = [];

    jest.spyOn(UserRepository.prototype, "list").mockReturnValueOnce(mockUsers);

    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expectedUsers);
  });

  it("Deve retornar um usuário corretamente", async () => {
    const mockUser: IUser = {
      id: 2,
      name: "gabriel",
      age: 20,
    };

    jest
      .spyOn(UserRepository.prototype, "findOne")
      .mockReturnValueOnce(mockUser);

    const expectUser: IUserResponse = {
      id: 2,
      name: "gabriel",
      age: 20,
      isOfAge: true,
    };

    const response = await request(app).get("/users/2");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expectUser);
  });

  it("Deve retornar uma mensagem de usuário não encontrado", async () => {
    jest
      .spyOn(UserRepository.prototype, "findOne")
      .mockReturnValueOnce(undefined);

    const response = await request(app).get("/users/2");
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toEqual("Usuário não encontrado");
  });

  it("Deve retornar uma mensagem de usuário excluído com sucesso", async () => {
    jest.spyOn(UserRepository.prototype, "delete").mockReturnValueOnce(true);

    const response = await request(app).delete("/users/2");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual("Usuário excluído com sucesso");
  });

  it("Deve retornar uma mensagem de falha ao excluir usuário", async () => {
    jest.spyOn(UserRepository.prototype, "delete").mockReturnValueOnce(false);

    const response = await request(app).delete("/users/2");
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toEqual("Falha ao remover o usuário");
  });

  it("Deve retornar uma mensagem de criação de usuário feita com sucesso", async () => {
    jest.spyOn(UserRepository.prototype, "save").mockReturnValueOnce(true);

    const response = await request(app).post("/users");
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual("Usuário criado com sucesso");
  });

  it("Deve retornar uma mensagem de falha na criação do usuário", async () => {
    jest.spyOn(UserRepository.prototype, "save").mockReturnValueOnce(false);

    const response = await request(app).post("/users");
    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.data).toEqual("Falha ao criar o usuário");
  });
});
