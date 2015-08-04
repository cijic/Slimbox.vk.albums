/**
 * Generate slimbox gallery with vk album images.
 *
 * @constructor
 */
function SlimboxGallery() {
    var self = this;
    self._apiUrl = 'https://api.vk.com/method/photos.get';
    self._albumUrlRegExp = /https?:\/\/vk.com\/album(-?\d+)_(\d+)/;

    // Setting up default options.
    self._options = {
        'order': 0,                 // 0: Date ascending; 1: Date descending.
        'loop': true,               // True: loop gallery. False: not.
        'linkType': 'div',          // Link type: number, image, div (image in div as background)
        'minSize': 'src_big',       // Minimum image size.
        'maxSize': 'src_xbig',      // Maximum image size.
        'containerSelector': 'div'  // Tag which contains album URL.
    };

    self._ownerID = null;
    self._albumID = null;

    /**
     * Set options.
     *
     * @param {object} options : Object of options.
     */
    function setOptions(options) {
        for (var property in options) {
            self._options[property] = options[property];
        }
    }

    function parseAlbumData(text) {
        if (self._ownerID !== null &&
            self._albumID !== null) {
            return;
        }

        var matched = text.match(self._albumUrlRegExp);

        if (matched === null) {
            return;
        }

        self._ownerID = matched[1];
        self._albumID = matched[2];
    }

    /**
     * Get images data from specified album.
     *
     * @param data : Needful data.
     */
    function getAlbumImagesData(data) {
        return $.ajax({
            'url': self._apiUrl,
            type: 'get',
            dataType: 'jsonp',
            data: data
        });
    }

    /**
     * Generate tag with presentation for gallery.
     *
     * @param {string} linkType : Link type (div, number, presentation).
     * @param {array} item : Array with photo data.
     * @param {number} i : Element position.
     * @returns {string} : Generate tag.
     */
    function getUrlPresentation(linkType, item, i) {

        /**
         * Image will be accessible via number link.
         *
         * @param {number} i : Number.
         * @returns {string|*} : String representation of number.
         */
        function presentNumber(i) {
            return i.toString();
        }

        /**
         * Image will be accessible via image link.
         *
         * @param {Array} item : Array with image data.
         * @returns {string} : String representation of image.
         */
        function presentImage(item) {
            return '<img src="' + item['src_big'] + '" alt="' + item['text'] + '">';
        }

        /**
         * Image will be accesible via image in div link.
         *
         * @param {Array} item : Array with image data.
         * @returns {string} : String respesentation of image in div.
         */
        function presentDiv(item) {
            return '<div class="picture" style="background:url(' + item['src_big'] + ') no-repeat 50% 30%; background-size: cover;"></div>';
        }

        var presentation = null;

        if (linkType == 'number') {
            presentation = presentNumber(i);
        } else if (linkType == 'image' || linkType == undefined) {
            presentation = presentImage(item);
        } else if (linkType == 'div') {
            presentation = presentDiv(item);
        }

        return presentation;
    }

    /**
     * Get images sizes for gallery.
     *
     * @returns {array} : Filtered size array.
     */
    function getSizeArray() {
        // Images sizes in JSON. Info source: from vk.com/dev documentation.
        var sizes = ['src_small', 'src', 'src_big', 'src_xbig', 'src_xxbig'];

        var minSize = null;

        if (self._options.hasOwnProperty('minSize')) {
            minSize = self._options['minSize'];
        } else {
            minSize = 'src_small';
        }

        var minSizeIndex = sizes.indexOf(minSize);
        var maxSize = null;

        if (self._options.hasOwnProperty('maxSize')) {
            maxSize = self._options['maxSize'];
        } else {
            maxSize = 'src_xxbig';
        }

        var maxSizeIndex = sizes.indexOf(maxSize);

        sizes = sizes.map(function (item, i) {
            if (i >= minSizeIndex &&
                i <= maxSizeIndex) {
                return item;
            }
        });

        return sizes;
    }

    /**
     * Get html representation of gallery.
     *
     * @param {object} urls : Object of arrays of images data.
     * @returns {string} : HTML representation of gallery.
     */
    function getHtml(urls) {
        var gallery = '';

        urls.response.forEach(function (item, i) {
            var url = null;
            var sizes = getSizeArray();

            for (var j = 0; j < sizes.length; j++) {
                var size = sizes[j];

                if (item.hasOwnProperty(size)) {
                    url = item[size];
                    break;
                }
            }

            if (url === null) {
                return;
            }

            var image = getUrlPresentation(self._options.linkType, item, i);
            gallery += '<a href="' + url + '" rel="lightbox-album' + self._ownerID + '_' + self._albumID + '" title="' + item['text'] + '">' + image + '</a>';
        });

        gallery = '<div class="album">' + gallery + '</div>';
        return gallery;
    }

    function handler() {
        self._options.html = $(self._options.containerSelector).html();
        parseAlbumData(self._options.html);

        getAlbumImagesData({
            'owner_id': self._ownerID,
            'album_id': self._albumID,
            'rev': self._options.order
        }).done(function (urls) {
            var gallery = getHtml(urls);
            $(self._options.containerSelector).trigger('generated', [gallery]);
        });
    }

    this.options = self._options;
    this.albumUrlRegExp = self._albumUrlRegExp;
    this.handler = handler;
    this.setOptions = setOptions;
}