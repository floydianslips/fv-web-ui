package ca.firstvoices.property_readers;

import ca.firstvoices.testUtils.ExportTestUtil;
import ca.firstvoices.utils.ExportColumnRecord;
import com.google.inject.Inject;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.nuxeo.ecm.automation.test.AutomationFeature;
import org.nuxeo.ecm.core.api.CoreSession;
import org.nuxeo.ecm.core.api.DocumentModel;
import org.nuxeo.ecm.core.event.EventService;
import org.nuxeo.ecm.core.test.CoreFeature;
import org.nuxeo.ecm.core.test.DefaultRepositoryInit;
import org.nuxeo.ecm.core.test.annotations.Granularity;
import org.nuxeo.ecm.core.test.annotations.RepositoryConfig;
import org.nuxeo.ecm.platform.test.PlatformFeature;
import org.nuxeo.elasticsearch.test.RepositoryElasticSearchFeature;
import org.nuxeo.runtime.test.runner.*;

import java.util.List;

import static org.junit.Assert.*;

@RunWith(FeaturesRunner.class)
@Features({RuntimeFeature.class, CoreFeature.class, PlatformFeature.class, AutomationFeature.class , RepositoryElasticSearchFeature.class} )
@RepositoryConfig(init = DefaultRepositoryInit.class, cleanup = Granularity.METHOD)
@Deploy( {
        "studio.extensions.First-Voices",
        "org.nuxeo.ecm.platform",
        "org.nuxeo.ecm.platform.commandline.executor",
        "org.nuxeo.ecm.platform.picture.core",
        //     "org.nuxeo.ecm.platform.rendition.core",
        "org.nuxeo.ecm.platform.video.core",
        "org.nuxeo.ecm.platform.audio.core",
        "org.nuxeo.ecm.automation.scripting",
        "org.nuxeo.ecm.platform.web.common",
        "org.nuxeo.ecm.core.event",
//        "FirstVoicesExport:OSGI-INF/extensions/ca.firstvoices.listeners.xml",
//        "FirstVoicesExport:OSGI-INF/extensions/ca.firstvoices.operations.xml",
//        "FirstVoicesExport:OSGI-INF/extensions/ca.firstvoices.schedulers.xml",
//        "FirstVoicesExport:OSGI-INF/extensions/ca.firstvoices.type.xml",
//        "FirstVoicesExport:OSGI-INF/extensions/ca.firstvoices.workers.xml",
        "FirstVoicesExport:schemas/fvexport.xsd",
        "FirstVoicesNuxeoPublisher:schemas/fvproxy.xsd",
        "FirstVoicesSecurity:OSGI-INF/extensions/ca.firstvoices.operations.xml",

        "FirstVoicesExport.test:OSGI-INF/extensions/ca.firstvoices.fake-directory-sql-contrib.xml",
        "FirstVoicesExport.test:OSGI-INF/extensions/ca.firstvoices.fakestudio.xml"

})

@Deploy( {
 //       "org.nuxeo.ecm.platform.forum.core:OSGI-INF/forum-schemas-contrib.xml",
 //       "org.nuxeo.elasticsearch.core:pageprovider-test-contrib.xml",
 //       "org.nuxeo.elasticsearch.core:schemas-test-contrib.xml",
//        "org.nuxeo.elasticsearch.core:elasticsearch-test-contrib.xml",
//        "FirstVoicesNuxeoPublisher:OSGI-INF/extensions/ca.firstvoices.templates.factories.xml",
//        "FirstVoicesNuxeoPublisher:OSGI-INF/extensions/ca.firstvoices.schemas.ProxySchema.xml",
//        "FirstVoicesNuxeoPublisher:OSGI-INF/extensions/ca.firstvoices.publisher.services.xml",
//        "FirstVoicesExport.test:OSGI-INF/extensions/ca.firstvoices.fake-load-action.xml",
//        "FirstVoicesExport.test:OSGI-INF/extensions/ca.firstvoices.fake-load-es-provider.xml",
} )


public class BooleanPropertyReaderTest
{
    ExportTestUtil testUtil;

    @Inject
    protected EventService eS;

    @Inject
    protected CoreSession session;

    @Before
    public void setUp() throws Exception
    {

        testUtil = new ExportTestUtil();

        assertNotNull("Should have a valid event service", eS );
        assertNotNull("Should have a valid session", session );

        testUtil.createSetup( session );
    }

    @Test
    public void testBooleanProp()
    {
        //ExportColumnRecord cr1 = new ExportColumnRecord("CHILD_FOCUSED", "fv:child_focused", true, 1, FV_BooleanPropertyReader.class, null);
        ExportColumnRecord cr2 = new ExportColumnRecord("CHILD_FRIENDLY", "fv:available_in_childrens_archive", true, 1, FV_BooleanPropertyReader.class, null);
        // CoreSession session, ExportColumnRecord spec, FV_AbstractProducer specOwner

        //FV_BooleanPropertyReader reader1 = new FV_BooleanPropertyReader(session, cr1, null);
        FV_BooleanPropertyReader reader2 = new FV_BooleanPropertyReader(session, cr2, null);

        DocumentModel[] docArray = testUtil.getTestWordsArray(session);
        int initialWordCount = docArray.length;
        assertNotEquals("Should have a non-empty list of words", initialWordCount, 0);

        for (DocumentModel word : docArray)
        {
//            List<FV_DataBinding> b1 = reader1.readPropertyFromObject(word);
//            assertNotNull("Return property should never be null", b1);
//            assertEquals("Return property list should never be empty and should have only 1 binding element", b1.size(), 1);
//            Object o1 = b1.remove(0);
//            assertTrue("Element of the list should be FV_DataBinding", o1 instanceof FV_DataBinding);
//            FV_DataBinding db1 = (FV_DataBinding) o1;
//            assertTrue("Boolean object should be represented by String value", db1.getReadProperty() instanceof String); // booleans are converted to 'true' or 'false' strings
//            String sbv1 = (String) db1.getReadProperty();
//            assertTrue("Boolean value should be set to true", sbv1.equals("true"));

            List<FV_DataBinding> b2 = reader2.readPropertyFromObject(word);
            assertNotNull("Return property should never be null", b2);
            assertEquals("Return property list should never be empty and should have only 1 binding element", b2.size(), 1);
            Object o2 = b2.remove(0);
            assertTrue("Element of the list should be FV_DataBinding", o2 instanceof FV_DataBinding);
            FV_DataBinding db2 = (FV_DataBinding) o2;
            assertTrue("Boolean object should be represented by String value", db2.getReadProperty() instanceof String); // booleans are converted to 'true' or 'false' strings
            String sbv2 = (String) db2.getReadProperty();
            assertTrue("Boolean value should be set to true", sbv2.equals("false"));
        }
    }
}