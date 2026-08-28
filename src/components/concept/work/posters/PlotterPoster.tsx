import type { CSSProperties, ReactElement } from "react"
import type { ConceptArtifactKind } from "../../conceptProjects"
import styles from "./PlotterPoster.module.css"

export type PlotterPosterProps = {
  kind: ConceptArtifactKind
  className?: string
}

type PositionedMark = {
  x: string
  y: string
  size?: string
}

const compressDots: PositionedMark[] = [
  { x: "4%", y: "18%", size: "5px" },
  { x: "12%", y: "32%", size: "8px" },
  { x: "2%", y: "52%", size: "4px" },
  { x: "18%", y: "62%", size: "6px" },
  { x: "8%", y: "79%", size: "4px" },
  { x: "25%", y: "11%", size: "4px" },
  { x: "29%", y: "40%", size: "7px" },
  { x: "27%", y: "86%", size: "5px" },
  { x: "38%", y: "24%", size: "5px" },
  { x: "41%", y: "68%", size: "4px" },
]

const attractNodes: PositionedMark[] = [
  { x: "11%", y: "21%", size: "8px" },
  { x: "23%", y: "77%", size: "6px" },
  { x: "36%", y: "10%", size: "5px" },
  { x: "72%", y: "18%", size: "7px" },
  { x: "88%", y: "35%", size: "5px" },
  { x: "82%", y: "74%", size: "8px" },
  { x: "64%", y: "88%", size: "5px" },
  { x: "15%", y: "52%", size: "4px" },
]

const socketAngles = [-90, -18, 54, 126, 198]

function RegistrationFrame() {
  return (
    <>
      <span className={`${styles.registration} ${styles.registrationNW}`} />
      <span className={`${styles.registration} ${styles.registrationNE}`} />
      <span className={`${styles.registration} ${styles.registrationSW}`} />
      <span className={`${styles.registration} ${styles.registrationSE}`} />
      <span className={styles.indexRule} />
      <span className={styles.indexDot} />
    </>
  )
}

function CompressDiagram() {
  return (
    <div className={`${styles.diagram} ${styles.compress}`}>
      <span className={styles.compressBaseline} />
      <span className={`${styles.aperture} ${styles.apertureOuter}`} />
      <span className={`${styles.aperture} ${styles.apertureInner}`} />
      <span className={styles.beam} />
      <span className={styles.beamSignal} />
      <span className={styles.beamTerminal} />
      <div className={styles.scatter}>
        {compressDots.map((dot, index) => (
          <span
            className={styles.scatterDot}
            key={index}
            style={
              {
                "--x": dot.x,
                "--y": dot.y,
                "--size": dot.size,
              } as CSSProperties
            }
          />
        ))}
        <span className={`${styles.convergeLine} ${styles.convergeLineA}`} />
        <span className={`${styles.convergeLine} ${styles.convergeLineB}`} />
        <span className={`${styles.convergeLine} ${styles.convergeLineC}`} />
      </div>
    </div>
  )
}

function AttractDiagram() {
  return (
    <div className={`${styles.diagram} ${styles.attract}`}>
      <span className={`${styles.halo} ${styles.haloOuter}`} />
      <span className={`${styles.halo} ${styles.haloInner}`} />
      <span className={styles.seedAxisX} />
      <span className={styles.seedAxisY} />
      <span className={styles.seed} />
      {attractNodes.map((node, index) => (
        <span
          className={styles.attractNode}
          key={index}
          style={
            {
              "--x": node.x,
              "--y": node.y,
              "--size": node.size,
            } as CSSProperties
          }
        />
      ))}
      <span className={`${styles.gravityLine} ${styles.gravityLineA}`} />
      <span className={`${styles.gravityLine} ${styles.gravityLineB}`} />
      <span className={`${styles.gravityLine} ${styles.gravityLineC}`} />
    </div>
  )
}

function UnfoldDiagram() {
  return (
    <div className={`${styles.diagram} ${styles.unfold}`}>
      <div className={styles.pleatField}>
        {Array.from({ length: 7 }, (_, index) => (
          <span
            className={styles.pleat}
            key={index}
            style={{ "--pleat-index": index } as CSSProperties}
          />
        ))}
      </div>
      <span className={styles.unfoldHinge} />
      <span className={styles.unfoldSignal} />
      <div className={styles.ruleField}>
        {Array.from({ length: 7 }, (_, index) => (
          <span className={styles.orderedRule} key={index} />
        ))}
      </div>
      <span className={styles.ruleIndexA} />
      <span className={styles.ruleIndexB} />
    </div>
  )
}

function RouteDiagram() {
  return (
    <div className={`${styles.diagram} ${styles.route}`}>
      <div className={styles.tributaryField}>
        {Array.from({ length: 5 }, (_, index) => (
          <span
            className={`${styles.tributary} ${styles[`tributary${index + 1}`]}`}
            key={index}
          />
        ))}
      </div>
      <span className={styles.routeGate} />
      <span className={styles.routeGateSignal} />
      <div className={styles.resolvedField}>
        {Array.from({ length: 5 }, (_, index) => (
          <span className={styles.resolvedLane} key={index} />
        ))}
      </div>
      <span className={styles.routeTerminal} />
    </div>
  )
}

function LoopDiagram() {
  return (
    <div className={`${styles.diagram} ${styles.loop}`}>
      <span className={`${styles.loopArc} ${styles.loopArcA}`} />
      <span className={`${styles.loopArc} ${styles.loopArcB}`} />
      <span className={`${styles.loopArc} ${styles.loopArcC}`} />
      <span className={`${styles.loopArc} ${styles.loopArcD}`} />
      <span className={styles.loopClosure} />
      <span className={styles.loopCenter} />
      <span className={styles.loopAxisX} />
      <span className={styles.loopAxisY} />
      {socketAngles.map((angle, index) => (
        <span
          className={styles.socket}
          key={angle}
          style={
            {
              "--socket-angle": `${angle}deg`,
              "--socket-index": index,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

const diagrams: Record<ConceptArtifactKind, () => ReactElement> = {
  compress: CompressDiagram,
  attract: AttractDiagram,
  unfold: UnfoldDiagram,
  route: RouteDiagram,
  loop: LoopDiagram,
}

export function PlotterPoster({ kind, className }: PlotterPosterProps) {
  const Diagram = diagrams[kind]

  return (
    <div
      className={`${styles.poster}${className ? ` ${className}` : ""}`}
      data-kind={kind}
      aria-hidden="true"
    >
      <span className={styles.paperGrid} />
      <span className={styles.filament} />
      <span className={styles.filamentSignal} />
      <RegistrationFrame />
      <Diagram />
    </div>
  )
}
