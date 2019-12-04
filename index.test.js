const index = require('./index')
const Octokit = require("@octokit/rest")
const octokit = new Octokit()

beforeEach(() => {
    jest.resetModules()
})

afterEach(() => {
    
})

describe('CreateIssueCommentFromActions', () => {
    it('will return text without mentions', () => {
        const testActions = ['Test Action 1','Test Action 2']
        const testInstructions = 'Special Instructions'
        const issueCommentText = index.createIssueCommentFromActions({
            actions: testActions,
            specialInstructions: testInstructions 
        })
        validateCreateIssue(issueCommentText, testActions, testInstructions)
    })

    it('will add the cc section with mentions', () => {
        const testActions = ['Test Action 1','Test Action 2']
        const testInstructions = 'Special Instructions'
        const testMentions = ['TestUser', 'TestUser2']

        const issueCommentText = index.createIssueCommentFromActions({
            actions: testActions,
            specialInstructions: testInstructions,
            mentions: testMentions
        })
        validateCreateIssue(issueCommentText, testActions,testInstructions)
        testMentions.forEach((mention) => {
            expect(issueCommentText).toContain(`@${mention}`)
        })
    })

    validateCreateIssue = (textToValidate, actions, instructions) => {
        actions.forEach((action) => {
            expect(textToValidate).toContain(`- ${action}`)
        })

        // Validate special instructions are there
        expect(textToValidate).toContain(instructions)


        // Validate **cc** is in the text
        expect(textToValidate).toContain('**cc:**')
    }
})

describe('GetUserInvitedCommentBody', () => {
    // Test with no repo and team
    it('Will return text without the repo or team', () => {
        const testUsername = 'TestUser'
        const testOrganization = 'TestOrg'
        const userInvitedCommentText = index.getUserInvitedCommentBody({
            username: testUsername,
            organization: testOrganization
        })
        validateText(userInvitedCommentText, testUsername, testOrganization)
    })

    validateText = (textToValidate, username, organization) => {
        expect(textToValidate).toContain(`@${username}`)
        expect(textToValidate).toContain(`${organization}`)
        expect(textToValidate).toContain(`**cc:**`)
    }
    // Test with team

    // Test with repo
})

describe('ParseMembership', () => {
    it('returns the attributes we care about', () => {
        const testState = 'active'
        const testRole = 'Sr. Undersecretaru of Funk'
        const testUserLogin = 'user'
        const testOrgLogin = 'user2'
        const testData = {
            state: testState,
            role: testRole,
            user: {
                login: testUserLogin 
            },
            organization: {
                login: testOrgLogin
            }
        }

        const validationTemplate = {
            state: testState,
            role: testRole,
            username: testUserLogin,
            organization: testOrgLogin
        }

        const parsedMembershipObject = index.parseMembership(testData)

        expect(parsedMembershipObject).toEqual(validationTemplate)
    })
})

describe('Paginate', () => {
    it('Calls our Paging Method', async () => {
        const octoMock = jest.spyOn(octokit, 'paginate')
        const endpointMock = jest.fn(x => true)

        await index.paginate({
            client: octokit,
            fn: { endpoint: endpointMock },
            fnOptions: null })

        expect(octoMock).toHaveBeenCalled()
        expect(endpointMock.mock.calls.length).toBe(1)
    })
})
