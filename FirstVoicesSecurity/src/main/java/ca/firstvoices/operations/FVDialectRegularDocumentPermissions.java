/*
 * (C) Copyright ${year} Nuxeo SA (http://nuxeo.com/) and contributors.
 *
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the GNU Lesser General Public License
 * (LGPL) version 2.1 which accompanies this distribution, and is available at
 * http://www.gnu.org/licenses/lgpl-2.1.html
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * Contributors:
 *     dyona
 */

package ca.firstvoices.operations;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.ecm.automation.core.Constants;
import org.nuxeo.ecm.automation.core.annotations.Operation;
import org.nuxeo.ecm.automation.core.annotations.OperationMethod;
import org.nuxeo.ecm.automation.core.collectors.DocumentModelCollector;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.api.DocumentNotFoundException;
import org.nuxeo.ecm.core.api.security.SecurityConstants;

import ca.firstvoices.utils.CustomSecurityConstants;

/**
 * This method will assign the correct permissions when a new dialect is created.
 */
@Operation(id = FVDialectRegularDocumentPermissions.ID, category = Constants.CAT_USERS_GROUPS, label = "FVDialectRegularDocumentPermissions", description = "")
public class FVDialectRegularDocumentPermissions extends AbstractFVDialectOperation {

    public static final String ID = "FVDialectRegularDocumentPermissions";

    private static final Log log = LogFactory.getLog(FVDialectRegularDocumentPermissions.class);

    @OperationMethod(collector = DocumentModelCollector.class)
    public DocumentModel run(DocumentModel input) {

        // Don't process published document
        if (input.isProxy()) {
            return input;
        }

        HashMap<String, String> groupsToCreate = new HashMap<String, String>();

        try {
            groupsToCreate.put(CustomSecurityConstants.LANGUAGE_ADMINS_GROUP, SecurityConstants.EVERYTHING);
            groupsToCreate.put(CustomSecurityConstants.RECORDERS_GROUP, CustomSecurityConstants.RECORD);
            groupsToCreate.put(CustomSecurityConstants.RECORDERS_APPROVERS_GROUP, CustomSecurityConstants.APPROVE);
            groupsToCreate.put(userManager.getGroupMembersField(), SecurityConstants.READ);

            for (Map.Entry<String, String> group : groupsToCreate.entrySet()) {
                processGroup(input, group);
            }
        } catch (DocumentNotFoundException e) {
            log.warn("Could not find document.", e);
        }

        return input;
    }

    @Override
    protected ArrayList<String> addParentsToGroup(ArrayList<String> currentGroups, DocumentModel groupDocModel,
            Map.Entry<String, String> currentGroup, DocumentModel input) {

        // All groups have their 'members' group as parent (except for members)
        if (!userManager.getGroupMembersField().equals(currentGroup.getKey())) {
            String dialectMembersGroupName = generateGroupNameFromDialect(input.getName(),
                    userManager.getGroupMembersField());
            currentGroups.add(dialectMembersGroupName);
        }

        // Recorders with Approval should have the Recorders group as a parent
        if (CustomSecurityConstants.RECORDERS_APPROVERS_GROUP.equals(currentGroup.getKey())) {
            String dialectRecordersGroupName = generateGroupNameFromDialect(input.getName(),
                    CustomSecurityConstants.RECORDERS_GROUP);
            currentGroups.add(dialectRecordersGroupName);
        }

        return currentGroups;
    }

}
