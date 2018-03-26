import t from 'tcomb-form';

import Dublincore from 'models/schemas/Dublincore';
import FVCore from 'models/schemas/FVCore';
import FVMedia from 'models/schemas/FVMedia';

import ConfGlobal from 'conf/local.json';

// Very basic email validation
var Email = t.subtype(t.Str, function (s) {
  return /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/.test(s);
});

var UserPreferences = t.maybe(t.struct({
  General: t.maybe(t.struct({
    primary_dialect: t.String
  })),
  Navigation: t.maybe(t.struct({
    start_page: t.enums(ConfGlobal.preferences.fields.start_page)
  })),
  Theme: t.maybe(t.struct({
    font_size: t.enums(ConfGlobal.preferences.fields.font_size)
  }))
}));

const fields = {
  FVWord: Object.assign({}, Dublincore, FVCore, {
    'fv-word:categories' : t.list(t.String),
    'fv-word:pronunciation' : t.maybe(t.String),
    'fv-word:related_phrases' : t.list(t.String),
    'fv-word:part_of_speech' : t.String,
    'fv-word:available_in_games' : t.Boolean
  }),
  FVPhrase: Object.assign({}, Dublincore, FVCore, {
    'fv:literal_translation' : t.maybe(t.String), // make optional
    'fv-phrase:phrase_books' : t.list(t.String)
  }),
  FVAudio: Object.assign({}, Dublincore, FVMedia),
  FVPicture: Object.assign({}, Dublincore, FVMedia),
  FVVideo: Object.assign({}, Dublincore, FVMedia),
  FVBook: Object.assign({}, Dublincore, FVCore, {
    'fv:definitions' : t.maybe(t.String), // make optional
    'fv:literal_translation' : t.maybe(t.String), // make optional
    'fvbook:title_literal_translation' : t.list(t.struct({
      'translation': t.String,
      'language': t.String
    })),
    'fvbook:introduction' : t.maybe(t.String),
    'fvbook:introduction_literal_translation' : t.maybe(t.list(t.struct({
      'translation': t.String,
      'language': t.String
    }))),
    'fvbook:author' : t.list(t.String),
    'fvbook:type' : t.String
  }),
  FVBookEntry: Object.assign({}, Dublincore, FVCore, {
    'fv:definitions' : t.maybe(t.String), // make optional
    'fv:available_in_childrens_archive' : t.maybe(t.String),
    'fv:literal_translation' : t.maybe(t.list(t.struct({
      'translation': t.String,
      'language': t.String
    }))),
    'fvbookentry:dominant_language_text' : t.list(t.struct({
      'translation': t.String,
      'language': t.String
    }))
  }),
  FVPortal : {
    'fv-portal:greeting': t.String,
    'fv-portal:featured_audio' : t.maybe(t.String),
    'fv-portal:about': t.String,
    'fv-portal:news': t.maybe(t.String),
    'fv-portal:background_top_image' : t.String,
    'fv-portal:logo' : t.String,
    'fv-portal:featured_words' : t.list(t.String),
    'fv-portal:related_links': t.list(t.String)
  },
  FVGallery: Object.assign({}, Dublincore, {
	'fv:related_pictures' : t.list(t.String)
  }),
  FVPhraseBook: Object.assign({}, Dublincore, {
	'fvcategory:image' : t.maybe(t.String),
  }),
  FVCategory: Object.assign({}, Dublincore, {
	'fvcategory:parent_category' : t.maybe(t.String),
	'fvcategory:image' : t.maybe(t.String),
  }),
  FVContributor: Object.assign({}, Dublincore),   
  FVDialect: Object.assign({}, Dublincore, {
    'fvdialect:country' : t.String,
    'fvdialect:dominant_language' : t.String,
    'fvdialect:region' : t.String,
    'fvdialect:keyboards' : t.list(t.String),
    'fvdialect:language_resources' : t.list(t.String),
    'fvdialect:contact_information' : t.String
  }),
  FVCharacter: Object.assign({}, {
    'dc:title': t.String,
    'fvcharacter:upper_case_character': t.String,
    'fvcharacter:alphabet_order': t.Number,
    'fvcharacter:related_words' : t.list(t.String),
    'fv:related_audio' : t.list(t.String)
  }),
  FVUser: {
    'userinfo:firstName': t.String,
    'userinfo:lastName': t.String,
    'userinfo:email': Email,
    'fvuserinfo:requestedSpace': t.String
  },
  FVUserProfile: {
    'firstName': t.String,
    'lastName': t.String,
    'email': Email,
    'preferences': UserPreferences
  },
  FVLink: Object.assign({}, Dublincore, {
    'dc:description': t.maybe(t.String),
    'fvlink:url': t.maybe(t.String)/*,
    'file:content': t.maybe(t.form.File)*/
  }),
  FVBulkImportCSV: Object.assign({}, {
    'file:content': t.form.File,
    'bulkImportRadioOptions': t.maybe(t.String)
  }),
}

export default fields;

// Sample usage with tcomb
// const FVPortal = t.struct(selectn('FVPortal', fields));