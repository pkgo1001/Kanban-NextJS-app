import {test, expect, request} from '@playwright/test';
test.describe.configure({ mode: 'serial' }); //Debido a hay pruebas que compiten por la base de datos, se debe ejecutar las pruebas una por una, por eso se configura en serial

test.describe('Authentication API Tests',  () => {

    test('Login API test',async({request})=> {       
        const response = await request.post('http://localhost:3000/api/auth/login',{
            data: {
                email: 'admin.dev@company.com',
                password: 'admin123'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
        console.log(response.status());
        console.log(response);
        console.log('--------------------------------');
        console.log(( await response.json()));
        expect(response.status()).toBe(200);
        expect(await response.json()).toHaveProperty('user.name', 'Admin Dev') //Debo darle la ruta del user.name en el json
        expect(await response.json()).toHaveProperty('token');
    })//test end
})//describe end

test.describe('Register API Tests', () => {
    var token: any;
    const newUser = {
        email: 'Nivel1NewUser@mail.com',
        password: 'TestPassword123!',
        name: 'User From API Test'
    }
    let newUserID: string
    test.beforeEach(async({request})=> {
        const loginResponse = await request.post('http://localhost:3000/api/auth/login',{
            data:{
                email: 'admin.dev@company.com',
                password: 'admin123'
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
        token = (await loginResponse.json()).token;
        console.log(token);
    })//beforeEach end

    test('Register, verify and delete user API test',async({request})=> {
       const response = await request.post('http://localhost:3000/api/auth/register',{
            data: {
                email: newUser.email,
                password: newUser.password,
                name: newUser.name
            },
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        newUserID = (await response.json()).user.id;
        console.log(newUserID);
        expect(response.status()).toBe(201)
        const verifyResponse = await request.post(`http://localhost:3000/api/users/${newUserID}/verify-email`,{
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        expect(verifyResponse.status()).toBe(200);

        const deleteResponse = await request.delete(`http://localhost:3000/api/users/${newUserID}`,{
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
expect(deleteResponse.status()).toBe(200);
    })//test end
})//describe end