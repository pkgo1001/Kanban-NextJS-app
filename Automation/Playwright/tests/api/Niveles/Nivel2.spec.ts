import {test, expect, request} from '@playwright/test'
import {logTestConfig, getTestUsers, getTestUser, getBaseURL} from '../../../config/test-config' 
test.describe.configure({ mode: 'serial' });

test.describe('Authentication API Tests', () => {
    test.beforeAll(()=> {
        logTestConfig();//print the test configuration
    })
    test('Login API test',async({request})=>{
        const roles = ['admin', 'supervisor', 'employee', 'viewer'] as const // as const makes it a tuple, not an array, so we can iterate over it like a tuple of strings (admin, supervisor, employee, viewer), not an array of strings (['admin', 'supervisor', 'employee', 'viewer']), so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array, so we can use the role as a string in the for loop, not as an index of the array
        const baseURL = getBaseURL()
        for (let role of roles) {
            const testUser = getTestUser(role)
            const response = await request.post(`${baseURL}/api/auth/login`,{
                data:{
                    email: testUser.email,
                    password: testUser.password
                },
                headers:{
                    'Content-Type': 'application/json'
                }
            })
            expect(response.status()).toBe(200)
            expect( await response.json()).toHaveProperty('token')
            console.log(`${role} login successful`);
        }  
    })//Test end
})//Describe end

test.describe('Another way to test Authetication',()=>{
    const roles = ['admin', 'supervisor', 'employee', 'viewer'] as const;
    const baseURL = getBaseURL()
    roles.forEach(role=>{
        test(`Login API test for ${role}`,async({request})=>{
            const testUser = getTestUser(role)
            const response = await request.post(`${baseURL}/api/auth/login`,{
                data:{
                    email: testUser.email,
                    password: testUser.password
                },
                headers:{
                    'Content-Type': 'application/json'
                }
            })
            expect(response.status()).toBe(200)
            expect( await response.json()).toHaveProperty('token')
            console.log(`${role} login successful`);
        })//Test end
    })//forEach end
})//Describe end

test.describe('New User API Tests',()=>{
    let token: string
    const baseURL = getBaseURL()
    let newUserID: string
    let newtaskID: string
    test.beforeEach(async({request})=>{
        const testUser = getTestUser('admin')
        const loginResponse = await request.post(`${baseURL}/api/auth/login`,{
            data:{
                email: testUser.email,
                password: testUser.password
            }
        }) 
        token = (await loginResponse.json()).token
    })//beforeEach end

    test('New User Flow  ',async({request})=>{
        const newUser = {
            email: `newuser-${Date.now()}@mail.com`,
            password: 'TestPassword123!',
            name: 'User From API Test'
        }
        await test.step('Register User',async()=>{
            const response = await request.post(`${baseURL}/api/auth/register`,{
                data: newUser,
                headers:{
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}`
                }
            })
            
            // Leer el response UNA SOLA VEZ
            const responseData = await response.json()
            console.log(responseData)
            
            expect(response.status()).toBe(201)
            expect(responseData).toHaveProperty('message', 'User registered successfully. Please check your email to verify your account.')
            expect(responseData).toHaveProperty('user')
            console.log(`New user registered: ${newUser.email}`);
            newUserID = responseData.user.id
        })
        await test.step('Verify User Email',async()=>{
            const response = await request.post(`${baseURL}/api/users/${newUserID}/verify-email`,{
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            expect(response.status()).toBe(200)
            expect( await response.json()).toHaveProperty('message', 'Email verified successfully')
            console.log(`User email verified`);
        })
        await test.step('Login with new user',async()=>{
            const response = await request.post(`${baseURL}/api/auth/login`,{
                data:{
                    email: newUser.email,
                    password: newUser.password
                }
            })
            expect(response.status()).toBe(200)
            expect( await response.json()).toHaveProperty('token')
            console.log(`User logged in`);
        })
        await test.step('Create task for new user',async ()=>{
            const response = await request.post(`${baseURL}/api/tasks`,{
                data:{
                    title: 'Test Task for new user PLAYWRIGHT',
                    description: 'Test Description for new user',
                    priority: 'low',
                    assignee: newUser.name,
                    dueDate: '2025-12-31',
                    tags: ['test', 'new user']
                },
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            expect(response.status()).toBe(200)
            expect( await response.json()).toHaveProperty('assignee', newUser.name)
            newtaskID = (await response.json()).id
        })
        await test.step('Move task to done status',async()=>{
            const response = await request.put(`${baseURL}/api/tasks/${newtaskID}`,{
                data:{
                    status: 'done'
                },
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            expect(response.status()).toBe(200)
            expect( await response.json()).toHaveProperty('status', 'done')
            console.log(`Task moved to done status`);
        })
        await test.step('Delete task',async()=>{    
            const response = await request.delete(`${baseURL}/api/tasks/${newtaskID}`,{
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            expect(response.status()).toBe(200)
            console.log(`Task deleted`);
        })
        await test.step('Delete User',async()=>{
            const response = await request.delete(`${baseURL}/api/users/${newUserID}`,{
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            expect(response.status()).toBe(200)
            expect( await response.json()).toHaveProperty('message', 'User deleted successfully')
            console.log(`User deleted`);
        })
    })//Test end
    test.afterAll(async({request})=>{
        // Obtener la lista de usuarios para verificar si el usuario nuevo aún existe
        const usersResponse = await request.get(`${baseURL}/api/users`,{
            headers:{
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        
        const users = await usersResponse.json()
        // Verificar si el usuario nuevo aún está presente
        const userExists = users.some((user: any) => user.id === newUserID)// Con some() buscamos si el usuario nuevo aún está presente en la lista de usuarios, si lo está, lo eliminamos.
        
        if (userExists) {
            console.log(`Cleanup: Deleting user ${newUserID}`);
            const response = await request.delete(`${baseURL}/api/users/${newUserID}`,{
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            expect(response.status()).toBe(200)
            console.log(`Cleanup: User deleted successfully`);
        } else {
            console.log(`Cleanup: User ${newUserID} was already deleted`);
        }
    })//afterAll end

})//Describe end
