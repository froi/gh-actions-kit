const outdent = require('outdent');

/**
 * Create a GitHub issue comment from a list of actions
 * @param {Object} options
 * @param {Array<string>} options.actions A list of action strings to include in the issue comment
 * @param {string} options.specialInstructions Any special instructions that might have been included in the original GitHub issue
 * @param {Array<string>} options.mentions A list of GitHub usernames to mention in the comment.
 */
function createIssueCommentFromActions({ actions, specialInstructions, mentions=[] }) {
    let actionsText = '';
    let specialInstructionsText = '';
    let mentionsText = '';

    actions.forEach(action => {
        actionsText += `- ${action} \n`
    });

    mentions.forEach(mention => {
        mentionsText = `@${mention} `
    })

    let issueText = outdent`
    # Issue proccessed

    ## The following actions were taken:

    ${actionsText}
    `

    if(specialInstructions && specialInstructions.trim().length > 0) {
      specialInstructionsText = outdent`
      ## Special Instructions

      ${specialInstructions}
      `
    }

    return outdent`
    ${issueText}

    ${specialInstructionsText}
    ---

    **cc:** ${mentionsText}
    `
}

/**
 * Get the GitHub Issue body for a user invite
 * @param {*} options
 * @param {string} options.username
 * @param {string} options.organization
 * @param {string} options.role
 * @param {string} options.repo
 * @param {string} options.teamName
 */
function getUserInvitedCommentBody({
    username,
    organization,
    role='member',
    repo=null,
    teamName=null}) {

    let teamText = '';
    let repoText = '';

    if(teamName) {
        teamText = outdent`
        **Team:** _${teamName}_

        **User team role:** _${role}_
        `;
    }

    if(repo) {
        repoText = `**Repo:** _${repo}_`;
    }

    return outdent`
    **User:** @${username} has been added to the **organization:** _${organization}_.

    ${repoText}

    ${teamText}

    **cc:** @froi @elstudio @stphnwlkr
    `;
}

/**
 * Parse the data for Organization membership.
 * @param {Object} data GitHub
 */
function parseMembership(data) {
    return {
        state: data.state,
        role: data.role,
        username: data.user.login,
        organization: data.organization.login
    }
}

/**
 * Paginate an Octokit list function and return the resutls. Octokit pagination docs: https://octokit.github.io/rest.js/#pagination
 *
 * @param {Object} options
 * @param {Object} options.client Octokit GitHub client
 * @param {function} options.fn The function to paginate Eg. octokit.orgs.listMembers
 * @param {Object} options.fnOptions Input options for the fn parameter
 */
async function paginate({ client, fn, fnOptions }) {
    try {
        return await client.paginate(fn.endpoint(fnOptions));
    } catch(error) {
        throw error;
    }
}
module.exports = {
    createIssueCommentFromActions,
    getUserInvitedCommentBody,
    parseMembership,
    paginate
}
