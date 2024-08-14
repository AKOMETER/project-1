import { Component } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import BlotFormatter from 'quill-blot-formatter';

Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/blotFormatter', BlotFormatter);


class Editor extends Component {
  constructor(props) {
    super(props);
  }

  handleChange(html) {
    this.setState({ editorHtml: html });

  }

  render() {
    return (
      <ReactQuill
        theme='snow'
        onChange={this.props.setValue}
        value={this.props.value}
        modules={{
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],

            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],

            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],

            ['clean'],
          ],
          clipboard: {
            matchVisual: true
          },
          imageResize: {
            parchment: Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize']
          },
          blotFormatter: {},
        }}
        formats={[
          'header',
          'font',
          'size',
          'bold',
          'italic',
          'underline',
          'strike',
          'blockquote',
          'list',
          'bullet',
          'indent',
          'link',
          'image',
          'video'
        ]}
        bounds={'#root'}
        placeholder={this.props.placeholder}
      />
    );
  }
}


// const modules = {
//     toolbar:
//         [
//             ['bold', 'italic', 'underline', 'strike'],
//             ['blockquote', 'code-block'],
//             ['link', 'image', 'video'],

//             [{ 'header': 1 }, { 'header': 2 }],
//             [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
//             [{ 'script': 'sub' }, { 'script': 'super' }],
//             [{ 'indent': '-1' }, { 'indent': '+1' }],
//             [{ 'direction': 'rtl' }],

//             [{ 'size': ['small', false, 'large', 'huge'] }],
//             [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

//             [{ 'color': [] }, { 'background': [] }],
//             [{ 'font': [] }],
//             [{ 'align': [] }],

//             ['clean']
//         ],
// }

// Editor.modules = {
//   toolbar: [
//     [{ header: '1' }, { header: '2' }, { font: [] }],
//     [{ size: [] }],
//     ['bold', 'italic', 'underline', 'strike', 'blockquote'],
//     [
//       { list: 'ordered' },
//       { list: 'bullet' },
//       { indent: '-1' },
//       { indent: '+1' }
//     ],
//     ['link', 'image', 'video'],
//     ['clean'],

//   ],
//   clipboard: {
//     matchVisual: false
//   },
//   imageResize: {
//     parchment: Quill.import('parchment'),
//     modules: ['Resize', 'DisplaySize']
//   }
// };


// Editor.formats = [
//   'header',
//   'font',
//   'size',
//   'bold',
//   'italic',
//   'underline',
//   'strike',
//   'blockquote',
//   'list',
//   'bullet',
//   'indent',
//   'link',
//   'image',
//   'video'
// ];

export default Editor;
