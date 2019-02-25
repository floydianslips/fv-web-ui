package ca.firstvoices.listeners;

import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.event.Event;
import org.nuxeo.ecm.core.event.EventContext;
import org.nuxeo.ecm.core.event.EventListener;
import org.nuxeo.ecm.core.event.impl.DocumentEventContext;

import ca.firstvoices.services.FVMoveUserToDialectServiceImpl;
import ca.firstvoices.utils.FVRegistrationUtilities;

/**
 *
 */
public class FVRegistrationCompletionListener implements EventListener {

    private static final Log log = LogFactory.getLog(ca.firstvoices.listeners.FVRegistrationCompletionListener.class);

    // accepts documentRemoved && registrationValidated

    @Override
    public void handleEvent(Event event) {
        EventContext ctx;
        ctx = event.getContext();
        if (!(ctx instanceof DocumentEventContext))
            return;

        DocumentEventContext docCtx = (DocumentEventContext) ctx;

        FVRegistrationUtilities regUtil = new FVRegistrationUtilities();
        FVMoveUserToDialectServiceImpl util = new FVMoveUserToDialectServiceImpl();
        Object[] args;
        DocumentModel dialect;

        switch (event.getName()) {
        case "newUserApprovedByLanguageAdministrator": // <event>newUserApprovedByLanguageAdministrator</event>
            dialect = docCtx.getSourceDocument();
            args = docCtx.getArguments();
            for (Object o : args) {
                if (o == null)
                    break;

                Map<String, String> cArg = (Map<String, String>) o;

                try {
                    util.placeNewUserInGroup(dialect, cArg.get("groupName"), cArg.get("userName"));
                } catch (Exception e) {
                    log.error(e);
                }

            }

            break;

        case "documentRemoved":
            // TODO: use it to make sure user name is not left in the system when registration is deleted on time out
            break;

        case "invitationValidated":
            args = docCtx.getArguments();

            for (Object o : args) {
                if (o == null)
                    break;

                DocumentModel ureg = (DocumentModel) o;
                String cArg = ureg.getType();

                if (cArg.equals("FVUserRegistration")) {
                    regUtil.registrationValidationHandler(ureg);
                }
            }
            break;
        }
    }
}