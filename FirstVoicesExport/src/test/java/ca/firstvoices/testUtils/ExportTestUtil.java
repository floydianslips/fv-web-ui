package ca.firstvoices.testUtils;

import static org.junit.Assert.*;

import org.nuxeo.ecm.automation.AutomationService;
import org.nuxeo.ecm.automation.OperationContext;
import org.nuxeo.ecm.automation.OperationException;
import org.nuxeo.ecm.core.api.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import static org.junit.Assert.assertNotNull;

public class ExportTestUtil
{
    private String[] words = {"ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN" };
    private DocumentModel word;
    private DocumentModel dialectDoc;
    private DocumentModel[] wordArray = null;
    private static int numMapsInTestList = 4;

    public DocumentModel getCurrentDialect()
    {
        return dialectDoc;
    }

    private void recursiveRemove( CoreSession session, DocumentModel parent )
    {
        DocumentModelList children =  session.getChildren(parent.getRef());

        for( DocumentModel child : children )
        {
            recursiveRemove( session, child );
        }

        session.removeDocument(parent.getRef());
        session.save();
    }

    private void startFresh( CoreSession session)
    {
        DocumentRef dRef = new PathRef("/FV");
        DocumentModel defaultDomain = session.getDocument(dRef);

        DocumentModelList children =  session.getChildren(defaultDomain.getRef());

        for( DocumentModel child : children )
        {
            recursiveRemove( session, child );
        }
    }

    public DocumentModel[] getTestWordsArray(CoreSession session)
    {
        DocumentModelList testWords =  session.query("SELECT * FROM FVWord WHERE ecm:isVersion = 0");
        assertNotNull("Should always have valid list of FVWords", testWords);
        DocumentModel[] docArray = new DocumentModel[testWords.size()];
        int i = 0;

        for( DocumentModel doc : testWords )
        {
            docArray[i] = doc;
            i++;
        }
        // keep converted array for later
        wordArray = docArray;

        return docArray;
    }


    public void publishWords( CoreSession session )
    {
        IntStream.range(0, wordArray.length).forEach(i -> assertTrue("Should succesfully publish word", session.followTransition(wordArray[i], "Publish")));
    }

    public void createSetup(CoreSession session )
    {
        startFresh(session);

        DocumentModel domain = createDocument(session, session.createDocumentModel("/", "FV", "Domain"));

        createDialectTree(session);

        createWords(session);

        session.save();

        wordArray = getTestWordsArray(session);

        assertNotNull("Should have a valid word array(1)", wordArray);
        publishWords( session );
        session.save();
    }

    public DocumentModel createDialectTree(CoreSession session)
    {
        assertNotNull("Should have a valid FVLanguageFamiliy",
                createDocument(session, session.createDocumentModel("/FV", "Family", "FVLanguageFamily")));
        assertNotNull( "Should have a valid FVLanguage",
                createDocument(session, session.createDocumentModel("/FV/Family", "Language", "FVLanguage")));
        dialectDoc = createDocument(session, session.createDocumentModel("/FV/Family/Language", "Dialect", "FVDialect"));
        assertNotNull("Should have a valid FVDialect", dialectDoc);

        return dialectDoc;
    }

    public DocumentModel createDocument(CoreSession session, DocumentModel model)
    {
        model.setPropertyValue("dc:title", model.getName());
        DocumentModel newDoc = session.createDocument(model);
        session.save();

        return newDoc;
    }

    public void createWords( CoreSession session)
    {
        Integer i = 0;

        for (String wordValue : words) {
            word = session.createDocumentModel("/FV/Family/Language/Dialect/Dictionary", wordValue, "FVWord");
            assertNotNull("Should have a valid FVWord model", word);
            word.setPropertyValue("fv:reference", wordValue );
            word = createDocument(session, word );
            assertNotNull("Should have a valid FVWord", word);
            i++;
        }
    }

//    private void commonOperationRunner(AutomationService automationService, DraftEditorService draftEditorServiceInstance, DocumentModel[] docArray, String operationSignature, String uuidKey )
//    {
//        for( DocumentModel aWord : docArray )
//        {
//            String uuid = draftEditorServiceInstance.getUUID( aWord, uuidKey );
//
//            if( uuid != null )
//            {
//                Object returnObj;
//                OperationContext ctx = new OperationContext(aWord.getCoreSession());
//                ctx.setInput(aWord);
//
//                Map<String, Object> params = new HashMap<String, Object>();
//
//                try
//                {
//                    returnObj = automationService.run(ctx, operationSignature, params);
//                }
//                catch (OperationException e)
//                {
//
//                }
//            }
//        }
//    }
}