import React from "react";
import { SketchField, Tools } from "react-sketch";
import Logo from "./Assests/Logo.png";
import DeleteIcon from "@mui/icons-material/Delete";
import FormatShapesIcon from "@mui/icons-material/FormatShapes";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import { Button, IconButton } from "@mui/material";
import EmptyImage from "./Assests/EmptyImage.svg";
import Carousel from "react-grid-carousel";
import Dropzone from "react-dropzone";
import "./App.css";

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      coordinates: {},  //{"imageindex":[coordinates]}
      tools: "rectangle",
      imageArray: [],  // {"fileName":"name","file":"file"}
      currentImageIndex: -1,
      imageWidth: 700,
      imageHeight: 500,
    };
  }

  // remove the rectangles from the image
  removeRectangles = (e) => {
    if(this.drawRef)
      this.drawRef.clear();
    this.setState({ tools: "rectangle" });
  };

  // exporting json file
  downloadJSONFile = async () => {
    const { imageArray, coordinates } = this.state;

    let coordinatesData = [];

    Object.keys(coordinates).map((item) => {
      const NewObject = {
        name: imageArray[item].fileName,
        rects: coordinates[item],
      };
      coordinatesData.push(NewObject);
      return null;
    });

    const fileName = "Export_coordinates";
    const json = JSON.stringify(coordinatesData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = await URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // storing files in imageArray
  onDrop = (files) => {
    const { imageArray, currentImageIndex } = this.state;
    files.map((file) => {
      this.setState({
        currentImageIndex: currentImageIndex === -1 ? 0 : currentImageIndex,
        imageArray: [
          ...imageArray,
          {
            fileName: file.name,
            file: URL.createObjectURL(file),
          },
        ],
      });
      return null;
    });
  };

  handleSubmit = (e) => {
    const { currentImageIndex, coordinates, imageHeight, imageWidth } =
      this.state;
    e.preventDefault();

    // if currentImage rectangle coordinates not present in coordinates array
    if (currentImageIndex in coordinates === false) {
      const rectangleRef = this.drawRef.toJSON();
      let data = [];

      // top left (left,top)
      // top right (left+width,top)
      // bottom left (left,top+height)
      // bottom right (left+width,top+height)

      rectangleRef.objects.map((item) => {
        const NewCoordinate = {
          x1: [
            (item.left / imageWidth).toFixed(2),
            (item.top / imageHeight).toFixed(2),
          ],
          x2: [
            ((item.left + item.width) / imageWidth).toFixed(2),
            (item.top / imageHeight).toFixed(2),
          ],
          y1: [
            (item.left / imageWidth).toFixed(2),
            ((item.top + item.height) / imageHeight).toFixed(2),
          ],
          y2: [
            ((item.left + item.width) / imageWidth).toFixed(2),
            ((item.top + item.height) / imageHeight).toFixed(2),
          ],
        };
        data.push(NewCoordinate);

        return null;
      });

      this.setState(
        {
          coordinates: { ...coordinates, [currentImageIndex]: data },
        },
        this.downloadJSONFile
      );
    } else {
      this.downloadJSONFile();
    }
  };

  // stores the rectangle coordinates of previous images
  onImageClicked = (previousImageIndex, currentImageIndex) => {
    const { imageWidth, imageHeight } = this.state;
    const rectangleRef = this.drawRef.toJSON();

    let data = [];

    // top left (left,top)
    // top right (left+width,top)
    // bottom left (left,top+height)
    // bottom right (left+width,top+height)
    rectangleRef.objects.map((item) => {
      const NewCoordinate = {
        x1: [
          (item.left / imageWidth).toFixed(2),
          (item.top / imageHeight).toFixed(2),
        ],
        x2: [
          ((item.left + item.width) / imageWidth).toFixed(2),
          (item.top / imageHeight).toFixed(2),
        ],
        y1: [
          (item.left / imageWidth).toFixed(2),
          ((item.top + item.height) / imageHeight).toFixed(2),
        ],
        y2: [
          ((item.left + item.width) / imageWidth).toFixed(2),
          ((item.top + item.height) / imageHeight).toFixed(2),
        ],
      };
      data.push(NewCoordinate);
      return null;
    });

    // storing the rectangle coordinates
    this.setState({
      coordinates: { ...this.state.coordinates, [previousImageIndex]: data },
    });

    this.removeRectangles();
    // changing the current Images Index
    this.setState({ currentImageIndex: currentImageIndex });
  };

  //  displaying images in the carousel
  displayImages = () => {
    const { imageArray, currentImageIndex } = this.state;

    return imageArray.map((item, index) => {
      return (
        <Carousel.Item key={index}>
          <img
            alt=""
            width="100%"
            onClick={() => this.onImageClicked(currentImageIndex, index)}
            className={
              index === currentImageIndex
                ? "main-carousel-selecteditem"
                : "main-carousel-item"
            }
            src={item.file}
          />
        </Carousel.Item>
      );
    });
  };

  // Generate random colors for rectanges
  generateRandomColor = () =>
    "rgb(" +
    Math.floor(Math.random() * 256) +
    "," +
    Math.floor(Math.random() * 256) +
    "," +
    Math.floor(Math.random() * 256) +
    ")";

  render() {
    const { tools, imageArray, currentImageIndex } = this.state;

    return (
      <React.Fragment>
        {/* Navbar section */}
        <div className="header">
          <img className="logo" src={Logo} alt="LITWIZ LABS" />
        </div>

        {/* Main section */}
        <div className="main">
          <div className="main-top">
            {/* Tools */}
            <div className="main-tools">
              <IconButton
                className="main-tools-icon"
                style={{ background: tools === "pan" ? "#bbb8b8" : "#f5f5f5" }}
                onClick={() =>
                  this.setState({ tools: tools === "pan" ? "rectangle" : "pan" })
                }
              >
                <OpenWithIcon />
              </IconButton>
              <IconButton
                className="main-tools-icon"
                style={{
                  background: tools === "select" ? "#bbb8b8" : "#f5f5f5",
                }}
                onClick={() =>
                  this.setState({
                    tools: tools === "select" ? "rectangle" : "select",
                  })
                }
              >
                <FormatShapesIcon />
              </IconButton>
              <IconButton
                className="main-tools-icon"
                style={{ background: "#f5f5f5" }}
                onClick={this.removeRectangles}
              >
                <DeleteIcon />
              </IconButton>
            </div>

            {/* large Image */}
            <div className="main-center">
              <div
                className="main-center-imgdiv"
                style={{
                  position: currentImageIndex === -1 ? "relative" : "absolute",
                }}
              >
                {currentImageIndex !== -1 ? (
                  <img
                    width="700px"
                    height="500px"
                    alt=""
                    className="main-center-imgdiv-image"
                    src={imageArray[currentImageIndex].file}
                  />
                ) : (
                  <>
                    <img
                      alt=""
                      className="main-center-imgdiv-emptyimage"
                      src={EmptyImage}
                    />
                    <h3 style={{ color: "#9e9e9e" }}>
                      Nothing to Show. Upload any image
                    </h3>
                  </>
                )}
              </div>
              <div className="main-center-canvasdiv">
                {currentImageIndex !== -1 && (
                  <SketchField
                    ref={(node) => (this.drawRef = node)}
                    width={700}
                    height={500}
                    tool={
                      tools === "select"
                        ? Tools.Select
                        : tools === "pan"
                        ? Tools.Pan
                        : Tools.Rectangle
                    }
                    lineColor={this.generateRandomColor}
                    lineWidth={3}
                  />
                )}
              </div>
            </div>

            {/* Actions section (upload/export) */}
            <div className="main-actions">
              <Button
                className="main-actions-export"
                onClick={this.handleSubmit}
              >
                Export
              </Button>

              <div className="main-actions-upload">
                <div className="main-actions-upload-title">Upload a File</div>
                <div className="main-actions-upload-section">
                  <div className="main-actions-upload-section-label">
                    <Dropzone onDrop={this.onDrop}>
                      {({ getRootProps, getInputProps }) => (
                        <section className="container">
                          <div {...getRootProps({ className: "dropzone" })}>
                            <input {...getInputProps()} />
                            <p>Click to browse or drag and drop your files</p>
                          </div>
                        </section>
                      )}
                    </Dropzone>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom carousel */}
          {currentImageIndex !== -1 && (
            <div className="main-carousel">
              <Carousel cols={5} rows={1} gap={10} loop>
                {this.displayImages()}
              </Carousel>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}
