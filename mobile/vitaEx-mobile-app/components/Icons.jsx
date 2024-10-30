import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Foundation from "@expo/vector-icons/Foundation";
//Tambien se pueden poner los iconos svg en un archivo separado como el logo

export const UserIcon = (props) => (
  <FontAwesome6 name="user" size={24} color="green" {...props} />
);

export const ChartIcon = (props) => (
  <FontAwesome6 name="chart-column" size={24} color="green" {...props} />
);

export const HomeIcon = (props) => (
  <FontAwesome5 name="home" size={24} color="green" {...props} />
);

export const ReserchsIcon = (props) => (
  <FontAwesome name="files-o" size={24} color="green" {...props} />
);

export const UploadIcon = (props) => (
  <FontAwesome name="upload" size={24} color="green" {...props} />
);

export const PdfIcon = (props) => (
  <FontAwesome name="file-pdf-o" size={24} color="green" {...props} />
);

export const ExcelIcon = (props) => (
  <FontAwesome name="file-excel-o" size={24} color="green" {...props} />
);

export const CsvIcon = (props) => (
  <FontAwesome5 name="file-csv" size={24} color="green" {...props} />
);

export const WordIcon = (props) => (
  <FontAwesome6 name="earth-americas" size={24} color="green" {...props} />
);

export const CheckIcon = (props) => (
  <FontAwesome name="check-circle" size={24} color="green" {...props} />
);

export const FileUploadIcon = (props) => (
  <FontAwesome5 name="file-upload" size={24} color="green" {...props} />
);

export const SerchIcon = (props) => (
  <FontAwesome name="search" size={24} color="green" {...props} />
);

export const FilterIcon = (props) => (
  <FontAwesome name="filter" size={24} color="green" {...props} />
);

export const EditIcon = (props) => (
  <FontAwesome name="edit" size={24} color="green" {...props} />
);

export const ExportIcon = (props) => (
  <FontAwesome5 name="file-export" size={24} color="green" />
);

export const ResultsIcon = (props) => (
  <Foundation name="results" size={24} color="green" />
);

export const ViewFileIcon = (props) => (
  <FontAwesome5 name="eye" size={24} color="green" />
);
