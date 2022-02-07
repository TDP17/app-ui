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

export class AdvancedLinkModel extends DefaultLinkModel {
  constructor(linkType: string) {
    if (linkType === "in") {
      super({
        type: "advanced",
        width: 2,
        color: "white",
      });
    } else if (linkType === "out") {
      super({
        type: "advanced",
        width: 2,
        color: "gray",
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
        e.link.registerListener({
          sourcePortChanged: (e: any) => {
            console.log("Source Port Changed", e);
          },
          targetPortChanged: (e: any) => {
            console.log("Target Port Changed", e);
          },
          selectionChanged: (e: any) => {
            if (e.isSelected)
              console.log("Selection Changed to (Link)", e.entity);
            else if (!e.isSelected)
              console.log("Selection Changed from (Link)", e.entity);
            else console.log("Selection Changed (Link)", e.entity);
          },
          entityRemoved: (e: any) => {
            console.log("Entity Removed (Link)", e.entity);
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

export const removeModelListener = (
  model: DiagramModel<DiagramModelGenerics>,
  listener: any
) => {
  model.deregisterListener(listener);
};

export const engine = createEngine();
export const model = new DiagramModel();

export const initModel = () => {
  engine.getLinkFactories().registerFactory(new AdvancedLinkFactory());

  const node1 = new DefaultNodeModel("Destination", "rgb(0,192,255)");
  const port1 = node1.addPort(new AdvancedPortModel(false, "in"));
  node1.setPosition(100, 100);

  const node2 = new DefaultNodeModel("Source", "rgb(192,255,0)");
  const port2 = node2.addPort(new AdvancedPortModel(true, "out"));
  node2.setPosition(500, 350);

  model.addAll(port1.link(port2));
  model.addAll(node1, node2);

  engine.setModel(model);
};
