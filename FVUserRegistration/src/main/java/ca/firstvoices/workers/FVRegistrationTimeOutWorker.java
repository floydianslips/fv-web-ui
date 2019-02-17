package ca.firstvoices.workers;

import ca.firstvoices.utils.FVRegistrationMailUtilities;
import ca.firstvoices.utils.FVRegistrationUtilities;
import org.nuxeo.ecm.core.api.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.nuxeo.ecm.core.work.AbstractWork;
import org.nuxeo.runtime.api.Framework;
import javax.security.auth.login.LoginContext;
import java.util.Calendar;

import static ca.firstvoices.operations.FVGetPendingUserRegistrations.APPROVED;
import static ca.firstvoices.utils.FVRegistrationConstants.*;

/**
 *
 */
public class FVRegistrationTimeOutWorker extends AbstractWork {

    private static final Log log = LogFactory.getLog(FVRegistrationTimeOutWorker.class);

    public static final String CATEGORY_CHECK_REGISTRATION_TIMEOUT = "checkEditLocks";

    @Override
    public String getCategory() {
        return CATEGORY_CHECK_REGISTRATION_TIMEOUT;
    }

    @Override
    public String getTitle() {
        return "Check user registration timeout.";
    }

    public FVRegistrationTimeOutWorker() {
        super("check-registration-timeout");
    }

    private int checkRegistrationTimeOut(Calendar dateRegistered) {
        long diffDays = FVRegistrationUtilities.calculateRegistrationAgeInDays(dateRegistered);
        long modHours = FVRegistrationUtilities.calculateRegistrationModHours(dateRegistered);

        int actionValue = 0;

        // currently set to check at 2am, 10am, 6pm
        if (diffDays == REGISTRATION_DELETION_IN_DAYS && modHours < 8)
            actionValue = REGISTRATION_DELETION_ACT;
        else if (diffDays == REGISTRATION_EXPIRATION_IN_DAYS && modHours < 8)
            actionValue = REGISTRATION_EXPIRATION_ACT;
        else if (diffDays == MID_REGISTRATION_PERIOD_IN_DAYS && modHours < 8)
            actionValue = MID_REGISTRATION_PERIOD_ACT;

        return actionValue;
    }

    @Override
    public void work() {
        LoginContext lctx = null;
        CoreSession s = null;
        FVRegistrationMailUtilities mailUtil = new FVRegistrationMailUtilities();

        try {
            lctx = Framework.login(); // system login
            s = CoreInstance.openCoreSession("default");

            DocumentModelList registrations = s.query(
                    String.format("Select * from Document where ecm:mixinType = 'UserRegistration'"));

            for (DocumentModel uReg : registrations) {
                Calendar regCreated = (Calendar) uReg.getPropertyValue("dc:created");

                int regTOType = checkRegistrationTimeOut(regCreated);

                // regTOType
                //
                // 0 - no action required (either already dealt with or still within no-action period)
                //
                // MID_REGISTRATION_PERIOD_ACT - registration is closing on timeout
                // an email needs to be sent to a user who started registration
                // and email informing LanguageAdministrator that user registration will be deleted in ? days
                //
                // REGISTRATION_EXPIRATION_ACT - registration timed out and it will be deleted in 24 hrs - last chance
                // to activate account
                // send an email to originator of registration request with information about cancellation
                //
                // REGISTRATION_DELETION_ACT - registration should be deleted
                //

                // if registration has lifecycle set to accepted user already provided password
                // and registration is just a reminder of the registration operation
                if (uReg.getCurrentLifeCycleState().equals(APPROVED)) {
                    mailUtil.emailReminder(regTOType, uReg, s);
                }

                if (regTOType == REGISTRATION_DELETION_ACT) {
                    log.info("Registration period expired for user" + uReg.getPropertyValue("userinfo:firstName") + " "
                            + uReg.getPropertyValue("userinfo:lastName") + ". Registration was deleted");
                    s.removeDocument(uReg.getRef());
                }
            }

            s.save();

        } catch (Exception e) {
            log.warn(e);
        } finally {
            try {
                if (lctx != null)
                    lctx.logout();
            } catch (Exception e) {
                log.warn(e);
            }
        }
    }

}
