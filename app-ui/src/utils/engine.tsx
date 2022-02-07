/**
 * For link customizations @see AdvancedLinkModel
 * The event positionChanged has been commented out to prevent logging clogging
 */

import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  DefaultPortModel,
  DefaultLinkFactory,
  DefaultLinkModel,
  DefaultLinkWidget,
} from "@projectstorm/react-diagrams";
import {
  DiagramModelGenerics,
  LinkWidget,
  PointModel,
} from "@projectstorm/react-diagrams-core";
import { MouseEvent } from "react";

/**
 * @param linkType -> The type of link (in/out), customize in/out links differently
 * Customizations to be passed in the super call, options available -
 * color: string
 * curvyness: number -> Link will not curve if arrow widget is attached
 * id: string
 * selectedColor: color as string -> Unclear as to what this does
 * type: string
 * width: number
 */
export class AdvancedLinkModel extends DefaultLinkModel {
  constructor(linkType: string) {
    if (linkType === "in") {
      super({
        type: "advanced",
        width: 2,
        color: "rgb(255,192,255)",
      });
    } else if (linkType === "out") {
      super({
        type: "advanced",
        width: 2,
        color: "white",
      });
    } else
      super({
        type: "advanced",
        width: 2,
        color: "white",
      });
  }
}

export class AdvancedPortModel extends DefaultPortModel {
  createLinkModel(): any {
    const linkType: string = this.getOptions().in ? "in" : "out";
    return new AdvancedLinkModel(linkType);
  }
}

const CustomLinkArrowWidget = (props: {
  color?: any;
  point?: any;
  previousPoint?: any;
}) => {
  const { point, previousPoint } = props;

  const angle =
    90 +
    (Math.atan2(
      point.getPosition().y - previousPoint.getPosition().y,
      point.getPosition().x - previousPoint.getPosition().x
    ) *
      180) /
      Math.PI;

  return (
    <g
      className="arrow"
      transform={
        "translate(" +
        point.getPosition().x +
        ", " +
        point.getPosition().y +
        ")"
      }
    >
      <g style={{ transform: "rotate(" + angle + "deg)" }}>
        <g transform={"translate(0, -3)"}>
          <polygon
            points="0,10 8,30 -8,30"
            fill={props.color}
            data-id={point.getID()}
            data-linkid={point.getLink().getID()}
          />
        </g>
      </g>
    </g>
  );
};

export class AdvancedLinkWidget extends DefaultLinkWidget {
  generateArrow(point: PointModel, previousPoint: PointModel): JSX.Element {
    return (
      <CustomLinkArrowWidget
        key={point.getID()}
        point={point as any}
        previousPoint={previousPoint as any}
        color={this.props.link.getOptions().color}
      />
    );
  }

  render() {
    const points = this.props.link.getPoints();
    const paths = [];
    this.refPaths = [];

    for (let j = 0; j < points.length - 1; j++) {
      paths.push(
        this.generateLink(
          LinkWidget.generateLinePath(points[j], points[j + 1]),
          {
            "data-linkid": this.props.link.getID(),
            "data-point": j,
            onMouseDown: (event: MouseEvent) => {
              this.addPointToLink(event, j + 1);
            },
          },
          j
        )
      );
    }

    for (let i = 1; i < points.length - 1; i++) {
      paths.push(this.generatePoint(points[i]));
    }

    if (this.props.link.getTargetPort() !== null) {
      paths.push(
        this.generateArrow(points[points.length - 1], points[points.length - 2])
      );
    } else {
      paths.push(this.generatePoint(points[points.length - 1]));
    }

    return (
      <g data-default-link-test={this.props.link.getOptions().testName}>
        {paths}
      </g>
    );
  }
}

export class AdvancedLinkFactory extends DefaultLinkFactory {
  constructor() {
    super("advanced");
  }

  generateReactWidget(event: { model: DefaultLinkModel }): JSX.Element {
    return (
      <AdvancedLinkWidget link={event.model} diagramEngine={this.engine} />
    );
  }
}

// Object containing data to be sent over to api
const data: { components: any; links: any } = {
  components: [],
  links: [],
};


// Currently called on render, node deletion, link creation (with valid target and source) and link deletion (with valid target and source).
const sendRequest = async () => {
  await fetch("http://localhost:3000/api/state/cache", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

/**
 * This registers listeners on the diagram model (canvas)
 * and takes care of adding/removing listeners to children links and nodes
 * @param model The model to add listener to
 * @todo Refactor this into smaller pieces
 */
export const addModelListener = (model: DiagramModel<DiagramModelGenerics>) => {
  const listener = model.registerListener({
    selectionChanged: (e: any) => {
      console.log("Selection Changed (Model)", e);
    },
    zoomUpdated: (e: any) => {
      console.log("Zoom Updated to", e.zoom);
    },
    offsetUpdated: (e: any) => {
      console.log("Offset Updated");
      console.log("Offset X", e.offsetX);
      console.log("Offset Y", e.offsetY);
    },
    gridUpdated: (e: any) => {
      console.log("Grid Updated", e);
    },
    entityRemoved: (e: any) => {
      console.log("Entity Removed (Model)", e);
    },
    pointsUpdated: (e: any) => {
      console.log("Points Updated", e);
    },

    // Very touchy methods
    linksUpdated: (e: any & { link: any; isCreated: any }) => {
      if (e.isCreated) {
        console.log("Link Created", e.link);

        if (e.link.sourcePort && e.link.targetPort) {
          data.links.push({
            id: e.link.options.id,
            src: e.link.sourcePort.parent.options.id,
            dest: e.link.targetPort.parent.options.id,
          });
        }

        e.link.registerListener({
          sourcePortChanged: (e: any) => {
            console.log("Source Port Changed", e);
            if (e.entity.sourcePort && e.entity.targetPort) {
              data.links.push({
                id: e.link.options.id,
                src: e.entity.sourcePort.parent.options.id,
                dest: e.entity.targetPort.parent.options.id,
              });
              sendRequest();
            }
          },
          targetPortChanged: (e: any) => {
            console.log("Target Port Changed", e);
            if (e.entity.sourcePort && e.entity.targetPort) {
              data.links.push({
                id: e.entity.options.id,
                src: e.entity.sourcePort.parent.options.id,
                dest: e.entity.targetPort.parent.options.id,
              });
              sendRequest();
            }
          },
          selectionChanged: (e: any) => {
            if (e.isSelected)
              console.log("Selection Changed to (Link)", e.entity);
            else if (!e.isSelected)
              console.log("Selection Changed from (Link)", e.entity);
            else console.log("Selection Changed (Link)", e.entity);
          },
          entityRemoved: (e: any) => {
            console.log("Entity Removed (Link)", e);
            const newLinks = data.links.filter(
              (link: { id: string; src: string; dest: string }) =>
                link.id !== e.entity.options.id
            );
            data.links = newLinks;
            sendRequest();
          },
        });
      } else if (!e.isCreated) {
        e.link.deregisterListener();
      } else {
        console.log("Link Updated", e.link);
      }
    },
    nodesUpdated: (e: any & { node: any; isCreated: any }) => {
      if (e.isCreated) {
        console.log("Node Created", e.node);

        data.components.push({
          id: e.node.options.id,
          name: e.node.options.name,
        });

        e.node.registerListener({
          selectionChanged: (e: any) => {
            if (e.isSelected)
              console.log("Selection Changed to (Node)", e.entity);
            else if (!e.isSelected)
              console.log("Selection Changed from (Node)", e.entity);
            else console.log("Selection Changed (Node)", e.entity);
          },
          entityRemoved: (e: any) => {
            console.log("Entity Removed (Node)", e.entity);
            const newData = data.components.filter(
              (component: { id: string; name: string }) =>
                component.id !== e.entity.options.id
            );
            data.components = newData;
            sendRequest();
          },
          // positionChanged: (e: any) => {
          //   console.log("Position changed", e);
          // },
        });
      } else if (!e.isCreated) {
        e.node.deregisterListener();
      } else console.log("Node Updated", e.node);
    },
  });
  return listener;
};

// Deregisters the listener
export const removeModelListener = (
  model: DiagramModel<DiagramModelGenerics>,
  listener: any
) => {
  model.deregisterListener(listener);
};

export const engine = createEngine();
export const model = new DiagramModel();


// Method to initialize the engine and reset data
export const initModel = () => {
  data.components = [];
  data.links = [];
  engine.getLinkFactories().registerFactory(new AdvancedLinkFactory());

  const node1 = new DefaultNodeModel("Destination", "rgb(255,192,0)");
  const port1 = node1.addPort(new AdvancedPortModel(false, "out", "out"));
  node1.setPosition(100, 100);

  const node2 = new DefaultNodeModel("Source", "rgb(255,192,255)");
  const port2 = node2.addPort(new AdvancedPortModel(true, "in", "in"));
  node2.setPosition(500, 100);

  const node3 = new DefaultNodeModel("Another Source", "rgb(255,192,255)");
  const port3 = node3.addPort(new AdvancedPortModel(true, "in", "in"));
  node3.setPosition(500, 500);

  model.addAll(port2.link(port1), port3.link(port2));
  model.addAll(node1, node2, node3);
  // model.addAll(node1, node2);
  sendRequest(); // Send initial request

  engine.setModel(model);
};
